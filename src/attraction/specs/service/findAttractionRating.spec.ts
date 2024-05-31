import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { AttractionService } from '@/attraction/attraction.service';
import { Attraction } from '@/attraction/schema/attraction.schema';
import { RatingDistribution } from '@/attraction/types/interfaces/ratingDistribution.interface';
import { FileUploadService } from '@/file/file.service';
import { Review } from '@/review/schema/review.schema';

describe('AttractionService', () => {
  let service: AttractionService;
  let reviewModel: Model<Review>;
  let attractionModel: Model<Attraction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttractionService,
        FileUploadService,
        ConfigService,
        {
          provide: getModelToken('Review'),
          useValue: {
            aggregate: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
        },
        {
          provide: getModelToken('Attraction'),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<AttractionService>(AttractionService);
    reviewModel = module.get<Model<Review>>(getModelToken('Review'));
    attractionModel = module.get<Model<Attraction>>(getModelToken('Attraction'));
  }, 10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an rating distribution array with valid attraction id', async () => {
    const mockAttractionId = '655afde160f02f37d6f444d3';
    const mockAttractionDoc = { _id: mockAttractionId };
    const mockResult: RatingDistribution[] = [
      {
        count: 7,
        rating: 5,
      },
      {
        count: 6,
        rating: 4,
      },
      {
        count: 4,
        rating: 3,
      },
      {
        count: 8,
        rating: 2,
      },
      {
        count: 5,
        rating: 1,
      },
    ];
    jest
      .spyOn(attractionModel, 'findOne')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockAttractionDoc) } as any);
    jest.spyOn(reviewModel, 'aggregate').mockResolvedValueOnce(mockResult);
    const result = await service.findAttractionRating(mockAttractionId);
    expect(reviewModel.aggregate).toBeCalledWith([
      { $match: { placeId: mockAttractionId, placeType: 'Attraction' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $project: { _id: 0, rating: '$_id', count: 1 } },
      { $sort: { rating: -1 } },
    ]);
    expect(result).toEqual(mockResult);
  });

  it('should throw NotFoundException with non-exist id', async () => {
    const mockAttractionId = '655afde160f02f37d6f444d0';
    jest
      .spyOn(attractionModel, 'findOne')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) } as any);
    await expect(service.findAttractionRating(mockAttractionId)).rejects.toThrowError(
      NotFoundException
    );
  });
});
