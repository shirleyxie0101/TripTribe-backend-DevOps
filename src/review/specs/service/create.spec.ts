import { getQueueToken } from '@nestjs/bull';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Document } from 'mongoose';

import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { ReviewService } from '@/review/review.service';
import { Review } from '@/review/schema/review.schema';
import { PhotoType } from '@/schema/photo.schema';
import { UserService } from '@/user/user.service';

describe('ReviewService.create', () => {
  let service: ReviewService;
  let fileService: FileUploadService;
  let reviewModel: Model<Review>;
  const current_userId = '655c94215ad11af262220c33';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtService,
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
          useValue: {},
        },
        {
          provide: getModelToken('Attraction'),
          useValue: {},
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
          useValue: { add: jest.fn(), process: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<ReviewService>(ReviewService);
    fileService = module.get<FileUploadService>(FileUploadService);
    reviewModel = module.get<Model<Review>>(getModelToken('Review'));
  }, 10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when placeId or placeType not exist', async () => {
    const mockParams = {
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'OtherPlace',
    };
    const { placeId, placeType } = mockParams;
    const mockCheckPlaceExists = jest.spyOn(service, 'checkPlaceExists').mockResolvedValue(false);
    await expect(service.create([], mockParams, current_userId)).rejects.toThrowError(
      NotFoundException
    );
    expect(mockCheckPlaceExists).toBeCalledWith(placeId, placeType);
  });

  it('should return a review with photos:[] when call create and files is empty array', async () => {
    const mockParams = {
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
    };

    const mockResult = {
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      photos: [],
      userId: '655c94215ad11af262220c33',
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
      _id: '6563e2a8d74487a4439c2254',
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-27T00:28:24.250Z',
      __v: 0,
    };

    jest.spyOn(service, 'checkPlaceExists').mockResolvedValue(true);

    const mockedReviewModelCreate = jest
      .spyOn(reviewModel, 'create')
      .mockReturnValueOnce(
        mockResult as unknown as Promise<
          (Document<unknown, unknown, Review> & Review & Required<{ _id: string }>)[]
        >
      );

    const result = await service.create([], mockParams, current_userId);

    expect(mockedReviewModelCreate).toBeCalledWith({
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
      photos: [],
      userId: current_userId,
    });

    expect(result).toEqual(mockResult);
  });

  it('should avoid xss attack when call create', async () => {
    const mockFiles = [];
    const mockParams = {
      title: 'For test xss attack',
      description: '<script>alert("xss")</script>',
      rating: 5,
      placeId: 'placeId',
      placeType: 'Attraction',
    };
    const mockResult = {
      title: 'For test xss attack',
      description: '&lt;script&gt;alert("xss")&lt;/script&gt;',
      rating: 5,
      photos: [],
      userId: '655c94215ad11af262220c33',
      placeId: 'placeId',
      placeType: 'Attraction',
      _id: '6563e2a8d74487a4439c2254',
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-27T00:28:24.250Z',
    };

    jest.spyOn(service, 'checkPlaceExists').mockResolvedValue(true);

    const mockedReviewModelCreate = jest
      .spyOn(reviewModel, 'create')
      .mockReturnValueOnce(
        mockResult as unknown as Promise<
          (Document<unknown, unknown, Review> & Review & Required<{ _id: string }>)[]
        >
      );

    await service.create(mockFiles, mockParams, current_userId);

    expect(mockedReviewModelCreate).toBeCalledWith({
      title: 'For test xss attack',
      description: '&lt;script&gt;alert("xss")&lt;/script&gt;',
      rating: 5,
      placeId: 'placeId',
      placeType: 'Attraction',
      photos: [],
      userId: current_userId,
    });
  });

  it('should return a review with photos data when call create and files is not empty array', async () => {
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
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
    };

    const mockResult = {
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      photos: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221be2',
        },
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 1',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94215ad11af262220c34',
        },
      ],
      userId: '655c94215ad11af262220c33',
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
      _id: '6563e2a8d74487a4439c2254',
      createdAt: '2023-11-27T00:28:24.250Z',
      updatedAt: '2023-11-27T00:28:24.250Z',
      __v: 0,
    };

    const mockUploadResult = [
      {
        data: {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221be2',
        },
      },
      {
        data: {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 1',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94215ad11af262220c34',
        },
      },
    ];

    jest.spyOn(service, 'checkPlaceExists').mockResolvedValue(true);

    jest.spyOn(fileService, 'uploadPhoto').mockResolvedValueOnce(mockUploadResult);

    const mockedReviewModelCreate = jest
      .spyOn(reviewModel, 'create')
      .mockReturnValueOnce(
        mockResult as unknown as Promise<
          (Document<unknown, unknown, Review> & Review & Required<{ _id: string }>)[]
        >
      );

    const result = await service.create(mockFiles, mockParams, current_userId);

    expect(mockedReviewModelCreate).toBeCalledWith({
      title: 'review New 13',
      description: 'This is a review new 1',
      rating: 5,
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: 'Attraction',
      photos: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94255ad11af262221be2',
        },
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee533 review photo 1',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
          imageType: PhotoType.REVIEW,
          uploadUserId: '655c94215ad11af262220c33',
          _id: '655c94215ad11af262220c34',
        },
      ],
      userId: current_userId,
    });

    expect(result).toEqual(mockResult);
  });
});
