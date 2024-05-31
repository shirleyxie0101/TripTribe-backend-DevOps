import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { ReviewService } from '@/review/review.service';
import { Review } from '@/review/schema/review.schema';
import { IReview } from '@/review/types/interfaces/review.do';
import { Photo, PhotoType } from '@/schema/photo.schema';
import { UserService } from '@/user/user.service';

interface IPhoto extends Photo {
  _id: string;
}
interface IReviews extends IReview {
  _id: string;
  photos: IPhoto[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

describe('ReviewService.findAll', () => {
  let service: ReviewService;
  let reviewModel: Model<Review>;
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
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
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
    reviewModel = module.get<Model<Review>>(getModelToken('Review'));
  }, 10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a reviews array when call findAll', async () => {
    const mockReviews: IReviews[] = [
      {
        _id: '655c94255ad11af262221be1',
        title: 'depereo subito viduo',
        description:
          'Torrens chirographum vitiosus aspernatur tribuo tandem. Suppono ad tabesco termes. Tui spero cotidie.',
        rating: 4,
        photos: [
          {
            imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
            imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
            imageType: PhotoType.REVIEW,
            uploadUserId: '655c94215ad11af262220c2f',
            _id: '655c94255ad11af262221be2',
          },
        ],
        userId: '655c94215ad11af262220c2f',
        placeId: '65573aecb5ccb958b78ee5fa',
        placeType: 'Attraction',
        createdAt: '2023-11-21T11:27:33.698Z',
        updatedAt: '2023-11-21T11:27:33.698Z',
        __v: 0,
      },
    ];

    const mockedReviewModelFind = jest.spyOn(reviewModel, 'find').mockReturnValueOnce({
      exec: () => mockReviews,
    } as any);

    const result = await service.findAll();

    expect(mockedReviewModelFind).toBeCalled();

    expect(result).toEqual([
      {
        _id: '655c94255ad11af262221be1',
        title: 'depereo subito viduo',
        description:
          'Torrens chirographum vitiosus aspernatur tribuo tandem. Suppono ad tabesco termes. Tui spero cotidie.',
        rating: 4,
        photos: [
          {
            imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
            imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
            imageType: PhotoType.REVIEW,
            uploadUserId: '655c94215ad11af262220c2f',
            _id: '655c94255ad11af262221be2',
          },
        ],
        userId: '655c94215ad11af262220c2f',
        placeId: '65573aecb5ccb958b78ee5fa',
        placeType: 'Attraction',
        createdAt: '2023-11-21T11:27:33.698Z',
        updatedAt: '2023-11-21T11:27:33.698Z',
        __v: 0,
      },
    ]);
  });
});
