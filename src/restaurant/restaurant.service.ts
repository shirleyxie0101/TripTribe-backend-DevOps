import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model, PipelineStage } from 'mongoose';

import { RatingDistribution } from '@/attraction/types/interfaces/ratingDistribution.interface';
import { DEFAULT_LIMIT, DEFAULT_SKIP } from '@/common/constant/pagination.constant';
import { FileUploadDto } from '@/file/dto/file-upload.dto';
import { FileUploadService } from '@/file/file.service';
import { Review } from '@/review/schema/review.schema';
import { PhotoType } from '@/schema/photo.schema';
import { GlobalSearchDto } from '@/search/dto/globalSearch.dto';
import { UserIdDto } from '@/user/dto/userId.dto';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { GetRestaurantListInput } from './dto/filter-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant, RestaurantFilterResult } from './schema/restaurant.schema';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    private readonly fileUploadService: FileUploadService,
    @InjectModel(Review.name) private reviewModel: Model<Review>
  ) {}

  async findAll(query: GetRestaurantListInput): Promise<RestaurantFilterResult> {
    const { sort, limit = DEFAULT_LIMIT, skip = DEFAULT_SKIP, filters } = query;
    const sortMappings = {
      rating_asc: { overAllRating: 1 },
      rating_desc: { overAllRating: -1 },
      cost_asc: { 'tags.cost': 1 },
      cost_desc: { 'tags.cost': -1 },
      default: { overAllRating: -1 },
    };

    const sortString = sortMappings[sort || 'default'];
    const aggregatePipeline: PipelineStage[] = [];

    if (filters) {
      const { meals, cuisines, cost, rating, location, distance, isOpenNow, currentTime } = filters;

      const parsedDate = dayjs(currentTime);

      const dayOfWeek = parsedDate.format('dddd');
      const current = parsedDate.format('HH:mm');

      if (location) {
        aggregatePipeline.push({
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
            distanceField: 'distance',
            spherical: true,
            maxDistance: distance,
            key: 'address.location',
          },
        });
      }

      if (isOpenNow) {
        aggregatePipeline.push({
          $addFields: {
            isOpen: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$openHours.' + dayOfWeek + '.period',
                      as: 'period',
                      cond: {
                        $and: [
                          { $gte: [current, '$$period.openTime'] },
                          { $lt: [current, '$$period.closeTime'] },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
          },
        });
      } else {
        aggregatePipeline.push({
          $addFields: {
            isOpen: false,
          },
        });
      }

      const matchList: object[] = [];

      if (meals && meals.length > 0) {
        matchList.push({
          'tags.meals': {
            $in: meals,
          },
        });
      }

      if (cuisines && cuisines.length > 0) {
        matchList.push({
          'tags.cuisines': {
            $in: cuisines,
          },
        });
      }

      if (cost) {
        matchList.push({
          'tags.cost': { $lte: cost },
        });
      }

      if (rating) {
        matchList.push({
          overAllRating: { $gte: rating },
        });
      }

      if (isOpenNow) {
        matchList.push(
          {
            [`openHours.${dayOfWeek}.isClosed`]: false,
          },
          { isOpen: true }
        );
      }

      aggregatePipeline.push({ $match: { $and: matchList } });
    }

    aggregatePipeline.push({
      $facet: {
        data: [
          {
            $sort: sortString,
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
        total: [{ $count: 'total' }],
      },
    });

    const [{ data, total }] = await this.restaurantModel.aggregate(aggregatePipeline);

    const restaurantsFilterResult: RestaurantFilterResult = {
      total: total.length > 0 ? total[0].total : 0,
      skip,
      limit,
      data: data || [],
    };

    return restaurantsFilterResult;
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException('this restaurant does not exist');
    }
    return restaurant;
  }

  async create(
    createRestaurantDto: CreateRestaurantDto,
    createdUserId: UserIdDto['_id'],
    files?: FileUploadDto[]
  ): Promise<Restaurant> {
    if (!files || !files.length) {
      const restaurant = {
        ...createRestaurantDto,
        createdUserId,
      };
      const createdRestaurant = new this.restaurantModel(restaurant);
      return await createdRestaurant.save();
    }
    const results = await this.fileUploadService.uploadPhoto(
      createdUserId,
      files,
      PhotoType.RESTAURANT
    );
    const photos = results.map((photo) => photo.data);

    const restaurant = {
      ...createRestaurantDto,
      photos,
      createdUserId,
    };

    const createdRestaurant = new this.restaurantModel(restaurant);
    return await createdRestaurant.save();
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
    createdUserId: UserIdDto['_id'],
    files?: FileUploadDto[]
  ): Promise<Restaurant> {
    if (!files || !files.length) {
      const updatedRestaurant = await this.restaurantModel
        .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
        .exec();
      if (!updatedRestaurant) {
        throw new NotFoundException('this restaurant does not exist');
      }
      return updatedRestaurant;
    }

    // update photos if adding new
    const results = await this.fileUploadService.uploadPhoto(
      createdUserId,
      files,
      PhotoType.RESTAURANT
    );
    const photos = results.map((photo) => photo.data);

    const { photos: currentPhotos } = await this.verifyRestaurant(id, createdUserId);
    const restPhotos = currentPhotos.filter(
      (photo) => updateRestaurantDto.photos?.some((p) => p.imageUrl === photo.imageUrl)
    );
    // TODO: update photos if photos order change
    const newPhotos = [...restPhotos, ...photos];
    const updatedDto = { ...updateRestaurantDto, photos: newPhotos };

    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updatedDto, { new: true })
      .exec();
    if (!updatedRestaurant) {
      throw new NotFoundException('this restaurant does not exist');
    }
    return updatedRestaurant;
  }

  // verify if current editor is the creator of the restaurant
  async verifyRestaurant(id: string, userId: string) {
    const restaurant = await this.findOne(id);
    if (userId.toString() !== restaurant.createdUserId.toString()) {
      throw new ForbiddenException('You have no permission to access this resource!');
    }
    return restaurant;
  }

  async findByKeyword(searchInfoDto: GlobalSearchDto): Promise<Restaurant[]> {
    const { keyword, limit, maxDistance, location } = searchInfoDto;

    if (!location) {
      const restaurants = await this.restaurantModel
        .find({
          $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { description: { $regex: new RegExp(keyword, 'i') } },
          ],
        })
        .limit(limit)
        .lean()
        .exec();

      return restaurants;
    }

    const restaurants = await this.restaurantModel.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [location.lng, location.lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: maxDistance || 10000,
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { description: { $regex: new RegExp(keyword, 'i') } },
          ],
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $limit: limit,
      },
    ]);
    return restaurants;
  }

  async remove(id: string, userId: UserIdDto['_id']) {
    await this.verifyRestaurant(id, userId);
    const restaurant = await this.restaurantModel.findByIdAndDelete(id).exec();
    if (!restaurant) {
      throw new NotFoundException('this restaurant does not exist');
    }
    return restaurant;
  }

  async findRestaurantRating(restaurantId: string): Promise<RatingDistribution[]> {
    const restaurant = await this.restaurantModel.findOne({ _id: restaurantId }).exec();
    if (!restaurant) {
      throw new NotFoundException('this restaurant does not exist');
    }
    const ratingDistribution = await this.reviewModel.aggregate([
      { $match: { placeId: restaurantId, placeType: 'Restaurant' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
      { $sort: { rating: -1 } },
    ]);
    return ratingDistribution;
  }
}
