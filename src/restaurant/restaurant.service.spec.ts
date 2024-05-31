import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { Photo, PhotoType } from '@/schema/photo.schema';

import { RestaurantService } from './restaurant.service';

interface IPhoto extends Photo {
  _id: string;
}
export interface IRestaurant extends Restaurant {
  _id: string;
  photos: IPhoto[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  distance?: number;
}

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantModel: Model<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        FileUploadService,
        ConfigService,
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
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<RestaurantService>(RestaurantService);
    restaurantModel = module.get<Model<Restaurant>>(getModelToken('Restaurant'));
  }, 10000);

  it('should return an restaurants array when call findByKeyword with location', async () => {
    const mockParams = {
      keyword: 'test',
      limit: 5,
      maxDistance: 999999,
      location: { lng: 0, lat: 1 },
    };

    const mockRestaurants: IRestaurant[] = [
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ];

    jest.spyOn(restaurantModel, 'aggregate').mockResolvedValueOnce(mockRestaurants);

    const result = await service.findByKeyword(mockParams);

    expect(restaurantModel.aggregate).toBeCalledWith([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [0, 1] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 999999,
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: new RegExp('test', 'i') } },
            { description: { $regex: new RegExp('test', 'i') } },
          ],
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    expect(result).toEqual([
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ]);
  });

  it('should return an restaurants array when call findByKeyword with location without maxDistance', async () => {
    const mockParams = {
      keyword: 'test',
      limit: 5,
      location: { lng: 0, lat: 1 },
    };

    const mockRestaurants: IRestaurant[] = [
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ];

    jest.spyOn(restaurantModel, 'aggregate').mockResolvedValueOnce(mockRestaurants);

    const result = await service.findByKeyword(mockParams);

    expect(restaurantModel.aggregate).toBeCalledWith([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [0, 1] },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 10000,
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: new RegExp('test', 'i') } },
            { description: { $regex: new RegExp('test', 'i') } },
          ],
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    expect(result).toEqual([
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ]);
  });

  it('should return an restaurants array when call findByKeyword without location', async () => {
    const mockParams = {
      keyword: 'a',
      limit: 4,
    };

    const mockRestaurants: IRestaurant[] = [
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ];

    jest.spyOn(restaurantModel, 'find').mockReturnValueOnce({
      limit: jest.fn().mockReturnValueOnce({
        lean: jest
          .fn()
          .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockRestaurants) }),
      }),
    } as any);

    const result = await service.findByKeyword(mockParams);

    expect(restaurantModel.find).toBeCalledWith({
      $or: [
        { name: { $regex: new RegExp('a', 'i') } },
        { description: { $regex: new RegExp('a', 'i') } },
      ],
    });

    expect(result).toEqual([
      {
        _id: '65573aecb5ccb958b78ee719',
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
      },
    ]);
  });
});
