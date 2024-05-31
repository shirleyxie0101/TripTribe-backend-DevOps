import { getQueueToken } from '@nestjs/bull';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { RatingDistribution } from '@/attraction/types/interfaces/ratingDistribution.interface';
import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { RestaurantFindOneDto } from '@/restaurant/dto/get-restaurant.dto';
import { RestaurantController } from '@/restaurant/restaurant.controller';
import { RestaurantService } from '@/restaurant/restaurant.service';
import { ReviewService } from '@/review/review.service';
import { UserService } from '@/user/user.service';

describe('Restaurant Controller', () => {
  let restaurantController: RestaurantController;
  let restaurantService: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        RestaurantService,
        FileUploadService,
        ConfigService,
        ReviewService,
        UserService,
        JwtService,
        {
          provide: getModelToken('Restaurant'),
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
          provide: getModelToken('Attraction'),
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

    restaurantController = module.get<RestaurantController>(RestaurantController);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  describe('get restaurant ratingDistribution', () => {
    it('should return rating distribution array with valid restaurant id', async () => {
      const mockRestaurantId = '655afde260f02f37d6f448b2';
      const mockResult: RatingDistribution[] = [
        {
          count: 5,
          rating: 5,
        },
        {
          count: 6,
          rating: 4,
        },
        {
          count: 6,
          rating: 3,
        },
        {
          count: 6,
          rating: 2,
        },
        {
          count: 7,
          rating: 1,
        },
      ];
      jest.spyOn(restaurantService, 'findRestaurantRating').mockResolvedValueOnce(mockResult);
      const result = await restaurantController.getRestaurantRating({ id: mockRestaurantId });
      expect(result).toEqual(mockResult);
      expect(restaurantService.findRestaurantRating).toHaveBeenCalledWith(mockRestaurantId);
    });

    it('should throw NotFoundException with non-exist restaurant id', async () => {
      const mockRestaurantId = '655afde260f02f37d6f448b0';
      jest
        .spyOn(restaurantService, 'findRestaurantRating')
        .mockRejectedValue(new NotFoundException('this restaurant does not exist'));
      await expect(
        restaurantController.getRestaurantRating({ id: mockRestaurantId })
      ).rejects.toThrowError(NotFoundException);
      await expect(
        restaurantController.getRestaurantRating({ id: mockRestaurantId })
      ).rejects.toThrow(new Error('this restaurant does not exist'));
      expect(restaurantService.findRestaurantRating).toHaveBeenCalledWith(mockRestaurantId);
    });

    it('should handle invalid attraction ID with DTO validation', async () => {
      const invalidDto: RestaurantFindOneDto = { id: 'invalidID' };
      jest
        .spyOn(restaurantService, 'findRestaurantRating')
        .mockRejectedValue(new BadRequestException('id must be a mongodb id'));
      await expect(
        restaurantController.getRestaurantRating({ id: invalidDto.id })
      ).rejects.toThrowError(BadRequestException);
      await expect(restaurantController.getRestaurantRating({ id: invalidDto.id })).rejects.toThrow(
        new Error('id must be a mongodb id')
      );
      expect(restaurantService.findRestaurantRating).toHaveBeenCalledWith(invalidDto.id);
    });
  });
});
