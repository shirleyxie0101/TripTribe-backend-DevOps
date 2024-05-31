import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model, PipelineStage } from 'mongoose';

import { Attraction, AttractionFilterResult } from '@/attraction/schema/attraction.schema';
import { DEFAULT_LIMIT, DEFAULT_SKIP } from '@/common/constant/pagination.constant';
import { FileUploadDto } from '@/file/dto/file-upload.dto';
import { FileUploadService } from '@/file/file.service';
import { Review } from '@/review/schema/review.schema';
import { PhotoType } from '@/schema/photo.schema';
import { GlobalSearchDto } from '@/search/dto/globalSearch.dto';
import { UserIdDto } from '@/user/dto/userId.dto';

import { CreateAttractionDto } from './dto/create-attraction.dto';
import { GetAttractionListInput } from './dto/filter-attraction.dto';
import { AttractionFindOneDto } from './dto/get-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { ICreateAttaraction } from './types/interfaces/createAttraction.do';
import { RatingDistribution } from './types/interfaces/ratingDistribution.interface';

@Injectable()
export class AttractionService {
  constructor(
    @InjectModel(Attraction.name) private attractionModel: Model<Attraction>,
    private uploadfileService: FileUploadService,
    @InjectModel(Review.name) private reviewModel: Model<Review>
  ) {}

  async findOne(id: string): Promise<Attraction> {
    const attraction = await this.attractionModel.findById(id).exec();
    if (!attraction) {
      throw new NotFoundException('this attraction does not exist');
    }
    return attraction;
  }

  async findAll(query: GetAttractionListInput): Promise<AttractionFilterResult> {
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
      const { types, durations, cost, rating, location, distance, isOpenNow, currentTime } =
        filters;

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

      if (types && types.length > 0) {
        matchList.push({
          'tags.types': {
            $in: types,
          },
        });
      }

      if (durations && durations.length > 0) {
        matchList.push({
          'tags.durations': {
            $in: durations,
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

    const [{ data, total }] = await this.attractionModel.aggregate(aggregatePipeline);

    const attractionsFilterResult: AttractionFilterResult = {
      total: total.length > 0 ? total[0].total : 0,
      skip,
      limit,
      data: data || [],
    };

    return attractionsFilterResult;
  }

  async create(
    userId: UserIdDto['_id'],
    attractionDto: CreateAttractionDto,
    files: FileUploadDto[]
  ): Promise<Attraction> {
    if (!files || !files.length) {
      const newAttraction: ICreateAttaraction = {
        ...attractionDto,
        createdUserId: userId,
        photos: [],
      };
      const createdAttraction = await this.attractionModel.create(newAttraction);
      return createdAttraction;
    }
    const results = await this.uploadfileService.uploadPhoto(userId, files, PhotoType.ATTRACTION);
    const photos = results.map((photo) => photo.data);
    const newAttraction: ICreateAttaraction = { ...attractionDto, createdUserId: userId, photos };
    const createdAttraction = await this.attractionModel.create(newAttraction);
    return createdAttraction;
  }

  async findByKeyword(searchInfoDto: GlobalSearchDto): Promise<Attraction[]> {
    const { keyword, limit, maxDistance, location } = searchInfoDto;

    if (!location) {
      const attractions = await this.attractionModel
        .find({
          $or: [
            { name: { $regex: new RegExp(keyword, 'i') } },
            { description: { $regex: new RegExp(keyword, 'i') } },
          ],
        })
        .limit(limit)
        .lean()
        .exec();
      return attractions;
    }

    const attractions = await this.attractionModel.aggregate([
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
    return attractions;
  }

  async updateAttraction(
    id: string,
    files: FileUploadDto[],
    updateAttractionDto: UpdateAttractionDto,
    userId: UserIdDto['_id']
  ): Promise<Attraction> {
    const current_userId = userId;
    const previousAttraction = await this.findOneFromMe(id, current_userId);
    const previousPhotos = previousAttraction?.photos;
    const currentPhotos = updateAttractionDto.photos || [];

    const deletePhotos = previousPhotos?.filter((photo) => {
      return !currentPhotos.some(
        (currentPhoto) => currentPhoto.imageUrl?.toString() === photo.imageUrl.toString()
      );
    });
    if (deletePhotos !== undefined && deletePhotos?.length > 0) {
      console.log('deletePhotos', deletePhotos);
      // TODO!!! if deletePhoto exists, call function to delete photos in db and aws
    }

    // upload new photos to AWS and save it with current photos
    if (files && files.length > 0) {
      const results = await this.uploadfileService.uploadPhoto(userId, files, PhotoType.ATTRACTION);
      const newPicArray = results.map((photo) => photo.data);
      currentPhotos.push(...newPicArray);
    }

    const dataToUpdate = { ...updateAttractionDto, userId, photos: currentPhotos };

    const updatedAttraction = await this.attractionModel
      .findByIdAndUpdate(id, dataToUpdate, { new: true })
      .exec();

    if (!updatedAttraction) {
      throw new BadRequestException('Update operation failed');
    }
    return updatedAttraction;
  }

  async findOneFromMe(attractionId: string, current_userId: string) {
    // find userId relate to review and compare with current userId
    const attractionData = await this.findOne(attractionId);
    const userId = attractionData?.createdUserId;
    // if userId not match, no permission to update
    if (current_userId.toString() !== userId?.toString()) {
      throw new ForbiddenException('You have no permission to access this resource!');
    }
    return attractionData;
  }

  async remove(id: AttractionFindOneDto['id'], userId: UserIdDto['_id']) {
    await this.findOneFromMe(id, userId);

    const review = await this.attractionModel.findByIdAndDelete(id).exec();
    return review;
  }

  async findAttractionRating(attractionId: string): Promise<RatingDistribution[]> {
    const attraction = await this.attractionModel.findOne({ _id: attractionId }).exec();
    if (!attraction) {
      throw new NotFoundException('this attraction does not exist');
    }
    const ratingDistribution = await this.reviewModel.aggregate([
      { $match: { placeId: attractionId, placeType: 'Attraction' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
      { $sort: { rating: -1 } },
    ]);
    return ratingDistribution;
  }
}
