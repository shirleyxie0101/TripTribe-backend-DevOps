import { getQueueToken } from '@nestjs/bull';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { AttractionController } from '@/attraction/attraction.controller';
import { AttractionService } from '@/attraction/attraction.service';
import { AttractionFindOneDto } from '@/attraction/dto/get-attraction.dto';
import { RatingDistribution } from '@/attraction/types/interfaces/ratingDistribution.interface';
import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { ReviewService } from '@/review/review.service';
import { UserService } from '@/user/user.service';

describe('Attraction Controller', () => {
  let attractionController: AttractionController;
  let attractionService: AttractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttractionController],
      providers: [
        AttractionService,
        FileUploadService,
        ConfigService,
        ReviewService,
        UserService,
        JwtService,
        {
          provide: getModelToken('Attraction'),
          useValue: {
            find: jest.fn(),
            aggregate: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
        },
        {
          provide: getModelToken('Review'),
          useValue: {},
        },
        {
          provide: getModelToken('Restaurant'),
          useValue: {},
        },
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUE_NAME_DATABASE_SYNC),
          useValue: {},
        },
      ],
    }).compile();

    attractionController = module.get<AttractionController>(AttractionController);
    attractionService = module.get<AttractionService>(AttractionService);
  });

  describe('get attraction ratingDistribution', () => {
    it('should return rating distribution array with valid attraction id', async () => {
      const mockAttractionId = '655afde160f02f37d6f444d3';
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
      jest.spyOn(attractionService, 'findAttractionRating').mockResolvedValueOnce(mockResult);
      const result = await attractionController.getAttractionRating({ id: mockAttractionId });
      expect(result).toEqual(mockResult);
      expect(attractionService.findAttractionRating).toHaveBeenCalledWith(mockAttractionId);
    });

    it('should throw NotFoundException with invalid attraction id', async () => {
      const mockAttractionId = '655afde160f02f37d6f444d0';
      jest
        .spyOn(attractionService, 'findAttractionRating')
        .mockRejectedValue(new NotFoundException('this attraction does not exist'));
      await expect(
        attractionController.getAttractionRating({ id: mockAttractionId })
      ).rejects.toThrowError(NotFoundException);
      await expect(
        attractionController.getAttractionRating({ id: mockAttractionId })
      ).rejects.toThrow(new Error('this attraction does not exist'));
      expect(attractionService.findAttractionRating).toHaveBeenCalledWith(mockAttractionId);
    });

    it('should handle invalid attraction ID with DTO validation', async () => {
      const invalidDto: AttractionFindOneDto = { id: 'invalidID' };
      jest
        .spyOn(attractionService, 'findAttractionRating')
        .mockRejectedValue(new BadRequestException('id must be a mongodb id'));
      await expect(
        attractionController.getAttractionRating({ id: invalidDto.id })
      ).rejects.toThrowError(BadRequestException);
      await expect(attractionController.getAttractionRating({ id: invalidDto.id })).rejects.toThrow(
        new Error('id must be a mongodb id')
      );
      expect(attractionService.findAttractionRating).toHaveBeenCalledWith(invalidDto.id);
    });
  });
});
