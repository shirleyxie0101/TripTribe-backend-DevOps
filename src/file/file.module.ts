import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Photo, PhotoSchema } from '@/schema/photo.schema';

import { FileUploadService } from './file.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Photo.name, schema: PhotoSchema }])],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
