import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import {
  QUEUE_NAME_DATABASE_SYNC,
  QUEUE_PROCESS_CALCULATE_OVERALLRATING,
} from '@/common/constant/queue.constant';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';

import { Review } from '../schema/review.schema';

@Processor(QUEUE_NAME_DATABASE_SYNC)
export class DatabaseSyncConsumer {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Attraction.name) private attractionModel: Model<Attraction>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>
  ) {}
  @Process(QUEUE_PROCESS_CALCULATE_OVERALLRATING)
  async calculateOverallRating(job: Job) {
    // console.log('JobId:', job.id);
    // console.log('jobData:', job.data);
    const { data } = job; // get data from job

    const result = await this.reviewModel.aggregate([
      {
        $match: {
          placeId: data.placeId,
        },
      },
      {
        $group: {
          _id: '$placeId',
          overAllRating: { $avg: '$rating' },
        },
      },
    ]);

    if (data.placeType === 'Attraction') {
      await this.attractionModel.findByIdAndUpdate(
        result[0]._id,
        {
          overAllRating: Number(result[0].overAllRating).toFixed(1),
        },
        { new: true }
      );
    } else if (data.placeType === 'Restaurant') {
      await this.restaurantModel.findByIdAndUpdate(
        result[0]._id,
        {
          overAllRating: Number(result[0].overAllRating).toFixed(1),
        },
        { new: true }
      );
    }
  }
}
