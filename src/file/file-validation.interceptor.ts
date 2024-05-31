import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FileUploadDto } from './dto/file-upload.dto';
import { FileUploadService } from './file.service';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService,
    private readonly fileUploadService: FileUploadService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: FileUploadDto[] = request.files;
    const invalidFiles: Array<{ file: FileUploadDto }> = [];
    if (files) {
      files.forEach((file) => {
        const maxFileSize = this.configService.get('uploader.middleware.maxFileSize');

        if (!this.fileUploadService.validateImage(file.mimetype) || file.size > maxFileSize) {
          invalidFiles.push({ file });
        }
      });
    }
    if (invalidFiles.length > 0) {
      const errorMessage = 'Invalid file exists. Please check file type or size.';
      const errorResponse = { message: errorMessage, invalidFiles };

      throw new BadRequestException(errorResponse);
    }
    return next.handle().pipe(
      catchError((err) => throwError(() => err)),
      map((data) => {
        return data;
      })
    );
  }
}
