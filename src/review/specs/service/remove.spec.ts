import { getQueueToken } from '@nestjs/bull';
import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { QUEUE_NAME_DATABASE_SYNC } from '@/common/constant/queue.constant';
import { FileUploadService } from '@/file/file.service';
import { PlaceType } from '@/review/dto/create-review.dto';
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

describe('ReviewService.remove', () => {
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
            exec: jest.fn(),
            findByIdAndDelete: jest.fn(),
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
          provide: getModelToken('Attraction'),
          useValue: {},
        },
        {
          provide: getModelToken('User'),
          useValue: {},
        },
        {
          provide: getQueueToken(QUEUE_NAME_DATABASE_SYNC),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<ReviewService>(ReviewService);
    reviewModel = module.get<Model<Review>>(getModelToken('Review'));
  }, 10000);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return deleted review when call remove and verify currentUser with reviewCreator pass', async () => {
    const reviewId: string = '6563d53576d44b652b8961d8';
    const current_userId: string = '655c94215ad11af262220c2f';

    const mockResult: IReviews = {
      _id: '6563d53576d44b652b8961d8',
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
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: PlaceType.ATTRACTION,
      createdAt: '2023-11-21T11:27:33.698Z',
      updatedAt: '2023-11-21T11:27:33.698Z',
      __v: 0,
    };

    const mockedServiceFindOneFromMe = jest
      .spyOn(service, 'findOneFromMe')
      .mockResolvedValueOnce(mockResult as any);

    jest.spyOn(reviewModel, 'findByIdAndDelete').mockReturnValueOnce({
      exec: () => mockResult,
    } as any);

    const result = await service.remove(reviewId, current_userId);

    expect(mockedServiceFindOneFromMe).toBeCalledWith(
      '6563d53576d44b652b8961d8',
      '655c94215ad11af262220c2f'
    );

    expect(reviewModel.findByIdAndDelete).toBeCalledWith('6563d53576d44b652b8961d8');

    expect(result).toEqual({
      _id: '6563d53576d44b652b8961d8',
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
      placeId: '6531d56a016ba782a35a8fd6',
      placeType: PlaceType.ATTRACTION,
      createdAt: '2023-11-21T11:27:33.698Z',
      updatedAt: '2023-11-21T11:27:33.698Z',
      __v: 0,
    });
  });

  it('should return Unauthorized when call remove and verify currentUser with reviewCreator not pass', async () => {
    const reviewId: string = '6563d53576d44b652b8961d8';
    const current_userId: string = '655c94215ad11af262220c33';

    const mockedReviewServiceFindOneFromMe = jest.spyOn(service, 'findOneFromMe');

    mockedReviewServiceFindOneFromMe.mockImplementation(() => {
      throw new ForbiddenException('You have no permission to access this resource!');
    });

    expect(() => {
      service.findOneFromMe('6563d53576d44b652b8961d8', '655c94215ad11af262220c33');
    }).toThrowError('You have no permission to access this resource!');

    expect(mockedReviewServiceFindOneFromMe).toBeCalledWith(
      '6563d53576d44b652b8961d8',
      '655c94215ad11af262220c33'
    );

    expect(reviewModel.findByIdAndDelete).not.toHaveBeenCalled();

    await expect(service.remove(reviewId, current_userId)).rejects.toThrowError(ForbiddenException);
  });
});
