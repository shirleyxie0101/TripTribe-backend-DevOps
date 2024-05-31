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
}
describe('AttractionService', () => {
  let service: AttractionService;
  let attractionModel: Model<Attraction>;
  let fileService: FileUploadService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttractionService,
        FileUploadService,
        ConfigService,
        {
          provide: getModelToken('Attraction'),
          useValue: {
            create: jest.fn(),
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
    fileService = module.get<FileUploadService>(FileUploadService);
  }, 10000);

  it('should return a attraction with photos:[] when call create and files is empty array', async () => {
    const mockUserId: string = '655c94215ad11af262220c33';

    const mockParams = {
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      photos: [],
      createdUserId: '',
    };

    const mockResult: IAttraction = {
      _id: '655c94215ad11af262220c33',
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      overAllRating: 2.9,
      photos: [],
      createdUserId: new Types.ObjectId('655c94215ad11af262220c33'),
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-17T10:05:58.127Z',
      __v: 0,
    };

    const mockedAttractionModelCreate = jest
      .spyOn(attractionModel, 'create')
      .mockReturnValueOnce(mockResult as any);

    const result = await service.create(mockUserId, mockParams, []);

    expect(mockedAttractionModelCreate).toBeCalledWith({
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      photos: [],
      createdUserId: '655c94215ad11af262220c33',
    });

    expect(result).toEqual({
      _id: '655c94215ad11af262220c33',
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      overAllRating: 2.9,
      photos: [],
      createdUserId: new Types.ObjectId('655c94215ad11af262220c33'),
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-17T10:05:58.127Z',
      __v: 0,
    });
  });

  it('should create an attraction with photos when files are provided', async () => {
    const mockUserId: string = '655c94215ad11af262220c33';
    const mockFiles = [
      {
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake file content', 'utf-8'),
        originalname: 'originalname',
        encoding: 'encoding',
      },
      {
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake file content', 'utf-8'),
        originalname: 'originalname',
        encoding: 'encoding',
      },
    ];
    const mockParams = {
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      photos: [],
      createdUserId: '',
    };
    const mockUploadResult = [
      {
        success: true,
        data: {
          _id: '655c94215ad11af262220c33',
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
        },
        imageName: '65573aecb5ccb958b78ee533',
      },
      {
        success: true,
        data: {
          _id: '655c94215ad11af262220c33',
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
        },
        imageName: '65573aecb5ccb958b78ee5fb',
      },
    ];
    const mockResult: IAttraction = {
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      overAllRating: 2.9,
      photos: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221be2',
        },
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221b66',
        },
      ],
      createdUserId: new Types.ObjectId('655c94215ad11af262220c33'),
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-27T00:28:24.250Z',
      __v: 0,
      _id: '6563e2a8d74487a4439c2254',
    };

    jest.spyOn(fileService, 'uploadPhoto').mockResolvedValueOnce(mockUploadResult);
    const mockedAttractionModelCreate = jest
      .spyOn(attractionModel, 'create')
      .mockReturnValueOnce(mockResult as any);

    const result = await service.create(mockUserId, mockParams, mockFiles);

    expect(mockedAttractionModelCreate).toBeCalledWith({
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
          lat: -57.8146,
          lng: 10.1117,
        },
      },
      photos: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94215ad11af262220c33',
        },
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94215ad11af262220c33',
        },
      ],
      createdUserId: '655c94215ad11af262220c33',
    });

    expect(result).toEqual({
      name: 'S 5th Street',
      website: 'http://stained-thief.info',

      description:
        'Universe aggredior suffoco calcar. Quisquam earum ipsam quis consequuntur acceptus alo victus. Vulnero corpus abbas sumptus tam anser versus traho patrocinor.',
      overAllRating: 2.9,
      address: {
        formattedAddress: '536 Mueller Ferry Apt. 633',
        location: {
          lat: -57.8146,
          lng: 10.1117,
        },
      },
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
      photos: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221be2',
        },
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.ATTRACTION,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221b66',
        },
      ],
      createdUserId: new Types.ObjectId('655c94215ad11af262220c33'),
      _id: '6563e2a8d74487a4439c2254',
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-27T00:28:24.250Z',
      __v: 0,
    });
  });
});
