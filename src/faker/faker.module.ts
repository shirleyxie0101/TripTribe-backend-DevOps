import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Attraction, AttractionSchema } from '@/attraction/schema/attraction.schema';
import { Restaurant, RestaurantSchema } from '@/restaurant/schema/restaurant.schema';
import { Review, ReviewSchema } from '@/review/schema/review.schema';
import { Photo, PhotoSchema } from '@/schema/photo.schema';
import { User, UserSchema } from '@/user/schema/user.schema';

import { FakerController } from './faker.controller';
import { FakerService } from './faker.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Attraction.name, schema: AttractionSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Photo.name, schema: PhotoSchema },
    ]),
  ],
  controllers: [FakerController],
  providers: [FakerService],
})
export class FakerModule {}
