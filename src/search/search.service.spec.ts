import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AttractionService } from '@/attraction/attraction.service';
import { FileUploadService } from '@/file/file.service';
import { RestaurantService } from '@/restaurant/restaurant.service';
import { IRestaurant } from '@/restaurant/restaurant.service.spec';
import { Photo, PhotoType } from '@/schema/photo.schema';

import { PlaceType } from './dto/globalSearch.dto';
import { SearchService } from './search.service';
import { IResultWithType } from './type/interfaces/resultWithType.do';

interface IPhoto extends Photo {
  _id: string;
}
interface IGlobalSearchResult extends IResultWithType {
  _id: string;
  photos: IPhoto[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

describe('SearchService', () => {
  let service: SearchService;
  let restaurantService: RestaurantService;
  let attractionService: AttractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        AttractionService,
        RestaurantService,
        FileUploadService,
        ConfigService,
        {
          provide: getModelToken('Attraction'),
          useValue: {},
        },
        {
          provide: getModelToken('Restaurant'),
          useValue: {},
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
        },
        {
          provide: getModelToken('Review'),
          useValue: {},
        },
      ],
    }).compile();
    service = module.get<SearchService>(SearchService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
    attractionService = module.get<AttractionService>(AttractionService);
  }, 10000);

  it('should return an array when call globalSearch', async () => {
    const mockParams = {
      keyword: 'test',
      limit: 5,
      maxDistance: 999999,
      location: { lng: 0, lat: 1 },
    };

    const mockRestaurantsSearchResult: IRestaurant[] = [
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
            lng: -88.3598,
            lat: -29.9485,
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

    const mockAttractionsSearchResult = [
      {
        _id: '65573aebb5ccb958b78ee39a',
        name: 'S 5th Street',
        description:
          'Universe aggredior suffoco calcar. Quisquam earum ipsam quis consequuntur acceptus alo victus. Vulnero corpus abbas sumptus tam anser versus traho patrocinor.',
        website: 'http://stained-thief.info',
        email: 'S5thStreet.DAmore@yahoo.com',
        phone: '956.841.0415 x234',
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
          formattedAddress: '536 Mueller Ferry Apt. 633',
          location: {
            lng: 10.1117,
            lat: -57.8146,
          },
        },
        overAllRating: 2.9,
        photos: [
          {
            imageAlt: 'Attraction photo 0',
            imageUrl: 'https://loremflickr.com/640/480/attraction?lock=3594513721327616',
            imageType: PhotoType.ATTRACTION,
            uploadUserId: '65562edc184d4aa3bc1c52a7',
            _id: '65573aebb5ccb958b78ee39b',
          },
        ],
        createdUserId: new Types.ObjectId('65562edc184d4aa3bc1c52a7'),
        createdAt: '2023-11-17T10:05:31.866Z',
        updatedAt: '2023-11-17T10:05:58.127Z',
        __v: 0,
        distance: 5530835.474964879,
      },
    ];

    jest
      .spyOn(restaurantService, 'findByKeyword')
      .mockResolvedValueOnce(mockRestaurantsSearchResult);

    jest
      .spyOn(attractionService, 'findByKeyword')
      .mockResolvedValueOnce(mockAttractionsSearchResult);

    const expectSearchResult: IGlobalSearchResult[] = [
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
            lng: -88.3598,
            lat: -29.9485,
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
        type: PlaceType.RESTAURANT,
      },
      {
        _id: '65573aebb5ccb958b78ee39a',
        name: 'S 5th Street',
        description:
          'Universe aggredior suffoco calcar. Quisquam earum ipsam quis consequuntur acceptus alo victus. Vulnero corpus abbas sumptus tam anser versus traho patrocinor.',
        website: 'http://stained-thief.info',
        email: 'S5thStreet.DAmore@yahoo.com',
        phone: '956.841.0415 x234',
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
          formattedAddress: '536 Mueller Ferry Apt. 633',
          location: {
            lng: 10.1117,
            lat: -57.8146,
          },
        },
        overAllRating: 2.9,
        photos: [
          {
            imageAlt: 'Attraction photo 0',
            imageUrl: 'https://loremflickr.com/640/480/attraction?lock=3594513721327616',
            imageType: PhotoType.ATTRACTION,
            uploadUserId: '65562edc184d4aa3bc1c52a7',
            _id: '65573aebb5ccb958b78ee39b',
          },
        ],
        createdUserId: new Types.ObjectId('65562edc184d4aa3bc1c52a7'),
        createdAt: '2023-11-17T10:05:31.866Z',
        updatedAt: '2023-11-17T10:05:58.127Z',
        __v: 0,
        distance: 5530835.474964879,
        type: PlaceType.ATTRACTION,
      },
    ];

    const result = await service.globalSearch(mockParams);

    expect(restaurantService.findByKeyword).toBeCalledWith({
      keyword: 'test',
      limit: 5,
      maxDistance: 999999,
      location: { lng: 0, lat: 1 },
    });

    expect(attractionService.findByKeyword).toBeCalledWith({
      keyword: 'test',
      limit: 5,
      maxDistance: 999999,
      location: { lng: 0, lat: 1 },
    });

    expect(result).toEqual(expectSearchResult);
  });
});
