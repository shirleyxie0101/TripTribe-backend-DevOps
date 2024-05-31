import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlExceptionFilter } from '@nestjs/graphql';
import * as Sentry from '@sentry/node';

interface IException {
  message?: string;
  error?: string;
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: IException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let exceptionMessage = exception.message ? exception.message : 'Internal Server Error';
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      exceptionMessage = exception.message;
      const response = exception.getResponse() as IException;
      if (response && response.error) {
        exceptionMessage = `${response.error} - ${response.message}`;
      }
    }
    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      exceptionMessage,
      exception,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    Sentry.captureException(exception);
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

// exception filter for GraphQL APIs
@Catch()
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown) {
    Sentry.captureException(exception);
    return exception;
  }
}
