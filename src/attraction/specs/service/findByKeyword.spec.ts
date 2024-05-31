import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';

import { AttractionService } from '@/attraction/attraction.service';
import { Attraction } from '@/attraction/schema/attraction.schema';
import { FileUploadService } from '@/file/file.service';
import { Photo, PhotoType } from '@/schema/photo.schema';

interface IPhoto extends Photo {
  _id: string;
}
export interface IAttraction extends Attraction {
  _id: string;
  photos: IPhoto[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  distance?: number;
}

describe('AttractionService', () => {
  let service: AttractionService;
  let attractionModel: Model<Attraction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttractionService,
        FileUploadService,
        ConfigService,
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
      ],
    }).compile();
    service = module.get<AttractionService>(AttractionService);
    attractionModel = module.get<Model<Attraction>>(getModelToken('Attraction'));
  }, 10000);

  it('should return an attractions array when call findByKeyword with location', async () => {
    const mockParams = {
      keyword: 'test',
      limit: 5,
      maxDistance: 999999,
      location: { lng: 0, lat: 1 },
    };

    const mockAttractions: IAttraction[] = [
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
            lng: -140.1176,
            lat: -88.9277,
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

    jest.spyOn(attractionModel, 'aggregate').mockResolvedValueOnce(mockAttractions);

    const result = await service.findByKeyword(mockParams);

    expect(attractionModel.aggregate).toBeCalledWith([
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
            lng: -140.1176,
            lat: -88.9277,
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
    ]);
  });

  it('should return an attractions array when call findByKeyword with location without maxDistance', async () => {
    const mockParams = {
      keyword: 'test',
      limit: 5,
      location: { lng: 0, lat: 1 },
    };

    const mockAttractions: IAttraction[] = [
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
            lng: -140.1176,
            lat: -88.9277,
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

    jest.spyOn(attractionModel, 'aggregate').mockResolvedValueOnce(mockAttractions);

    const result = await service.findByKeyword(mockParams);

    expect(attractionModel.aggregate).toBeCalledWith([
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
            { name: { $regex: new RegExp(mockParams.keyword, 'i') } },
            { description: { $regex: new RegExp(mockParams.keyword, 'i') } },
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
            lng: -140.1176,
            lat: -88.9277,
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
    ]);
  });

  it('should return an attractions array when call findByKeyword without location', async () => {
    const mockParams = {
      keyword: 'a',
      limit: 4,
    };

    const mockAttractions: IAttraction[] = [
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
            lng: -140.1176,
            lat: -88.9277,
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
      },
    ];

    jest.spyOn(attractionModel, 'find').mockReturnValueOnce({
      limit: jest.fn().mockReturnValueOnce({
        lean: jest
          .fn()
          .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(mockAttractions) }),
      }),
    } as any);

    const result = await service.findByKeyword(mockParams);

    expect(attractionModel.find).toBeCalledWith({
      $or: [
        { name: { $regex: new RegExp('a', 'i') } },
        { description: { $regex: new RegExp('a', 'i') } },
      ],
    });

    expect(result).toEqual([
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
            lng: -140.1176,
            lat: -88.9277,
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
      },
    ]);
  });
});
