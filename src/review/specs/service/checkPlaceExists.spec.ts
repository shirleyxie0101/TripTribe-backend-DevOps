import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { IRestaurant } from '@/restaurant/restaurant.service.spec';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { ReviewService } from '@/review/review.service';
import { PhotoType } from '@/schema/photo.schema';
import { UserService } from '@/user/user.service';

describe('ReviewService.checkPlaceExists', () => {
  let service: ReviewService;
  let restaurantModel: Model<Restaurant>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        FileUploadService,
        ConfigService,
        UserService,
        JwtService,
        {
          provide: getModelToken('Review'),
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken('Restaurant'),
          useValue: {
            findById: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Attraction'),
          useValue: {
            findById: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
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
    service = module.get<ReviewService>(ReviewService);
    restaurantModel = module.get<Model<Restaurant>>(getModelToken('Restaurant'));
  }, 10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if placeType is wrong', async () => {
    const placeId = '6563d53576d44b652b8961d8';
    const placeType = 'OtherPlace';

    const result = await service.checkPlaceExists(placeId, placeType);
    expect(result).toEqual(false);
  });

  it('should return false if placeId does not exist', async () => {
    const placeId = '6563d53576d44b652b8961d8';
    const placeType = 'Restaurant';

    const mockedRestaurantModelFind = jest.spyOn(restaurantModel, 'findById').mockReturnValueOnce({
      exec: () => null,
    } as any);

    const result = await service.checkPlaceExists(placeId, placeType);
    expect(mockedRestaurantModelFind).toBeCalledWith('6563d53576d44b652b8961d8');
    expect(result).toEqual(false);
  });

  it('should return true when place exists', async () => {
    const placeId = '6563d53576d44b652b8961d9';
    const placeType = 'Restaurant';
    const mockRestaurant: IRestaurant = {
      _id: '6563d53576d44b652b8961d9',
      name: 'Westgate',
      description:
        'Deporto perferendis facilis caelestis decretum amita sint sumo concido. Atrox denuo molestias adicio tabesco. Accusantium vallum spes sodalitas facere armarium asperiores.',
      website: 'http://vigorous-hyphenation.info',
      email: 'Westgate_Kilback@gmail.com',
      phone: '1-403-425-0674 x61968',
      openHours: {
        Monday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Tuesday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Wednesday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Thursday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Friday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Saturday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
        Sunday: {
          isOpenAllDay: false,
          isClosed: false,
          period: [
            {
              openTime: '06:00',
              closeTime: '18:00',
            },
          ],
        },
      },
      address: {
        formattedAddress: '652 Fay Islands Suite 584',
        location: {
          lng: -140.1176,
          lat: -88.9277,
        },
      },
      overAllRating: 3.2,
      photos: [
        {
          imageAlt: 'Restaurant photo 0',
          imageUrl: 'https://loremflickr.com/640/480/restaurant?lock=911877389418496',
          imageType: PhotoType.RESTAURANT,
          uploadUserId: '65562edb184d4aa3bc1c5295',
          _id: '65573aecb5ccb958b78ee71a',
        },
      ],
      createdUserId: new Types.ObjectId('65562edb184d4aa3bc1c5295'),
      createdAt: '2023-11-17T10:05:32.388Z',
      updatedAt: '2023-11-17T10:05:58.125Z',
      __v: 0,
      distance: 0,
    };
    const mockedRestaurantModelFind = jest.spyOn(restaurantModel, 'findById').mockReturnValueOnce({
      exec: () => mockRestaurant,
    } as any);

    const result = await service.checkPlaceExists(placeId, placeType);
    expect(mockedRestaurantModelFind).toBeCalledWith('6563d53576d44b652b8961d9');
    expect(result).toEqual(true);
  });
});
