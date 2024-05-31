import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Attraction, AttractionSchema } from '@/attraction/schema/attraction.schema';
import { FileUploadModule } from '@/file/file.module';
import { PermissionGroupModule } from '@/permission-group/permission-group.module';
import { ReviewModule } from '@/review/review.module';
import { Review, ReviewSchema } from '@/review/schema/review.schema';

import { AttractionController } from './attraction.controller';
import { AttractionResolver } from './attraction.resolver';
import { AttractionService } from './attraction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attraction.name, schema: AttractionSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    FileUploadModule,
    ReviewModule,
    PermissionGroupModule,
  ],
  controllers: [AttractionController],
  providers: [AttractionService, AttractionResolver],
  exports: [AttractionService],
})
export class AttractionModule {}
