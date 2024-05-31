import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bull';
import { Model, Types } from 'mongoose';
import xss from 'xss';

import { Attraction, AttractionDocument } from '@/attraction/schema/attraction.schema';
import { DEFAULT_REVIEW_LIMIT, DEFAULT_SKIP } from '@/common/constant/pagination.constant';
import { PlaceType } from '@/common/constant/place-type';
import { QUEUE_PROCESS_CALCULATE_OVERALLRATING } from '@/common/constant/queue.constant';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';
import { PaginationResult } from '@/dto/pagination-result.dto';
import { CreatePhotoDto } from '@/file/dto/create-photo.dto';
import { FileUploadDto } from '@/file/dto/file-upload.dto';
import { FileUploadService } from '@/file/file.service';
import { Restaurant, RestaurantDocument } from '@/restaurant/schema/restaurant.schema';
import { PhotoType } from '@/schema/photo.schema';
import { UserIdDto } from '@/user/dto/userId.dto';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserReview } from './dto/user-review.dto';
import { Review } from './schema/review.schema';
import { ReviewCreator } from './types/interfaces/review-creator';
import { IReview } from './types/interfaces/review.do';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    private readonly fileUploadService: FileUploadService,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(Attraction.name) private attractionModel: Model<Attraction>,
    private readonly userService: UserService,
    @InjectQueue('database-sync') private databaseSync: Queue
  ) {}
  async create(files: FileUploadDto[], reviewDto: CreateReviewDto, userId: UserIdDto['_id']) {
    const { placeId, placeType } = reviewDto;
    const place = await this.checkPlaceExists(placeId, placeType);
    if (!place) {
      throw new NotFoundException('The place id or place type does not exist');
    }
    let photoDocuments: CreatePhotoDto[] = [];

    if (files && files.length > 0) {
      const uploadResults = await this.fileUploadService.uploadPhoto(
        userId,
        files,
        PhotoType.REVIEW
      );

      photoDocuments = uploadResults.map((photo) => photo.data);
    }

    // sanitize review description
    reviewDto.description = xss(reviewDto.description);

    // spread reviewDto and put "photos" and "userId" together in reviewData
    const reviewData: IReview = { ...reviewDto, userId, photos: photoDocuments };

    const review = await this.reviewModel.create(reviewData);

    await this.databaseSync.add(
      QUEUE_PROCESS_CALCULATE_OVERALLRATING,
      {
        placeType: review.placeType,
        placeId: review.placeId,
      },
      { delay: 100 }
    );

    return review;
  }

  async findAll() {
    const reviews = await this.reviewModel.find().exec();
    return reviews;
  }

  async findOne(id: QueryReviewDto['id']) {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException('The review does not exist');
    }
    return review;
  }

  async update(
    id: QueryReviewDto['id'],
    files: FileUploadDto[],
    updateReviewDto: UpdateReviewDto,
    userId: UserIdDto['_id']
  ): Promise<Review> {
    // verify if current user is owner
    const previousReview = await this.findOneFromMe(id, userId);

    const previousPhotos = previousReview?.photos;
    let currentPhotos = updateReviewDto.photos;

    // compare 2 photos array (previousPhotos and currentPhotos), find deletePhotos array
    let deletePhotos;
    if (currentPhotos) {
      deletePhotos = previousPhotos?.filter((photo) => {
        return !currentPhotos?.some(
          (currentPhoto) => currentPhoto?.imageUrl?.toString() === photo.imageUrl.toString()
        );
      });
    } else {
      currentPhotos = [];
      deletePhotos = previousPhotos;
    }
    if (deletePhotos !== undefined && deletePhotos?.length > 0) {
      console.log('deletePhotos', deletePhotos);
      // TODO!!! if deletePhoto exists, call function to delete photos in DB and AWS
    }

    // upload new photos to AWS and save it with current photos
    if (files && files.length > 0) {
      const results = await this.fileUploadService.uploadPhoto(userId, files, PhotoType.REVIEW);
      const newPicArray = results.map((photo) => photo.data);
      currentPhotos.push(...newPicArray);
    }

    const dataToUpdate: IReview = {
      ...updateReviewDto,
      userId,
      photos: currentPhotos,
    };

    // call model to set 'dataToUpdate' to update
    const review = await this.reviewModel.findByIdAndUpdate(id, dataToUpdate, { new: true }).exec();
    if (!review) {
      throw new BadRequestException('Update operation failed');
    }

    await this.databaseSync.add(
      QUEUE_PROCESS_CALCULATE_OVERALLRATING,
      {
        placeType: review.placeType,
        placeId: review.placeId,
      },
      { delay: 100 }
    );

    return review;
  }

  async findOneFromMe(reviewId: string, current_userId: string) {
    // find userId relate to review and compare with current userId
    const reviewData = await this.findOne(reviewId);
    const userId = reviewData?.userId;
    // if userId not match, no permission to update
    if (current_userId.toString() !== userId?.toString()) {
      throw new ForbiddenException('You have no permission to access this resource!');
    }
    return reviewData;
  }

  async findAllByPlaceTypeAndId(placeType: PlaceType, placeId: string, query: GetDataListInput) {
    const isPlaceExist = await this.checkPlaceExists(placeId, placeType);
    if (!isPlaceExist) {
      throw new NotFoundException('The place does not exist');
    }
    const { limit = DEFAULT_REVIEW_LIMIT, skip = DEFAULT_SKIP } = query;
    const total = await this.reviewModel.countDocuments({ placeType, placeId }).exec();
    const pageCount = Math.ceil(total / limit);

    const reviews = await this.reviewModel
      .find({ placeId, placeType })
      .populate<{ creator: User }>('creator')
      .limit(limit)
      .skip(skip)
      .exec();
    const result: PaginationResult<ReviewCreator[]> = {
      data: reviews,
      limit,
      skip,
      total,
      pageCount,
    };
    return result;
  }

  async findAllByUserId(userId: string, query: GetDataListInput) {
    const { limit = DEFAULT_REVIEW_LIMIT, skip = DEFAULT_SKIP } = query;
    const user = await this.userService.findOne(userId);
    // there are two userId types in database (string and ObjectId)
    const userIds = [userId, new Types.ObjectId(userId)];
    const total = await this.reviewModel.countDocuments({ userId: { $in: userIds } }).exec();
    const pageCount = Math.floor((total - 1) / limit) + 1;
    const reviews = await this.reviewModel
      .find({ userId: { $in: userIds } })
      .populate<{ placeId: Attraction | Restaurant }>('placeId')
      .limit(limit)
      .skip(skip)
      .exec();
    const data: UserReview = { creator: user, reviews: reviews };
    const result: PaginationResult<UserReview> = { data, limit, skip, total, pageCount };
    return result;
  }

  async remove(id: QueryReviewDto['id'], userId: UserIdDto['_id']) {
    // verify if current user is owner
    await this.findOneFromMe(id, userId);

    const review = await this.reviewModel.findByIdAndDelete(id).exec();

    await this.databaseSync.add(
      QUEUE_PROCESS_CALCULATE_OVERALLRATING,
      {
        placeType: review?.placeType,
        placeId: review?.placeId,
      },
      { delay: 100 }
    );

    return review;
  }

  async checkPlaceExists(placeId: string, placeType: string): Promise<boolean> {
    if (placeType !== 'Restaurant' && placeType !== 'Attraction') {
      return false;
    }
    let document: RestaurantDocument | AttractionDocument | null = null;

    if (placeType === 'Restaurant') {
      document = await this.restaurantModel.findById(placeId).exec();
    } else if (placeType === 'Attraction') {
      document = await this.attractionModel.findById(placeId).exec();
    }

    return !!document;
  }
}
