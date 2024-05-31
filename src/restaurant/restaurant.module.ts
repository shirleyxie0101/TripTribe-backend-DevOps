import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileUploadModule } from '@/file/file.module';
import { ReviewModule } from '@/review/review.module';
import { Review, ReviewSchema } from '@/review/schema/review.schema';

import { RestaurantController } from './restaurant.controller';
import { RestaurantResolver } from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';
import { Restaurant, RestaurantSchema } from './schema/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    FileUploadModule,
    ReviewModule,
  ],
  controllers: [RestaurantController],
  exports: [RestaurantService],
  providers: [RestaurantService, RestaurantResolver],
})
export class RestaurantModule {}
