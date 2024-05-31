import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Attraction, AttractionSchema } from '@/attraction/schema/attraction.schema';
import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadModule } from '@/file/file.module';
import { Restaurant, RestaurantSchema } from '@/restaurant/schema/restaurant.schema';
import { UserModule } from '@/user/user.module';

import { DatabaseSyncConsumer } from './consumers/review.consumer';
import { ReviewController } from './review.controller';
import { ReviewResolver } from './review.resolver';
import { ReviewService } from './review.service';
import { Review, ReviewSchema } from './schema/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Attraction.name, schema: AttractionSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    FileUploadModule,
    forwardRef(() => UserModule),
    BullModule.registerQueue({
      name: QUEUE_NAME_DATABASE_SYNC,
    }),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, DatabaseSyncConsumer, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
