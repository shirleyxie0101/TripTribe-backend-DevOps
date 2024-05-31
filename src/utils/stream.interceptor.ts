import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class StreamInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('in stream interceptor before route handler...');

    return next.handle().pipe(
      tap((data: string) => {
        console.log('in stream interceptor after route handler...');

        const response = context.switchToHttp().getResponse() as Response;

        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const chunks = data.split(' ');
        this.sendStream(response, chunks); // ! res.write()
        // }
      })
    );
  }

  private async sendStream(res: Response, chunks: string[]) {
    // Text messages are stored inside request body using the Deep Chat JSON format: https://deepchat.dev/docs/connect
    for (let i = 0; i < chunks.length; i++) {
      res.write(`data: ${JSON.stringify({ text: `${chunks[i]} ` })}\n\n`);

      await new Promise((resolve) => setTimeout(resolve, 70)); // simulate stream
    }

    res.end();
  }
}
