import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { PhotoType } from '@/schema/photo.schema';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

describe('UserService.updateUser', () => {
  let service: UserService;
  let userModel: Model<User>;
  let fileUploadService: FileUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        FileUploadService,
        JwtService,
        ConfigService,
        {
          provide: getModelToken('User'),
          useValue: {
            exec: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Restaurant.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Attraction.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const userId = '65693d3bd09cde779fae7c1d';
    const mockUser = null;

    const mockUserModelFindById = jest
      .spyOn(userModel, 'findById')
      .mockReturnValueOnce({ exec: () => mockUser } as any);
    await expect(service.updateUser(userId, {}, null)).rejects.toThrow(NotFoundException);

    expect(mockUserModelFindById).toHaveBeenCalledWith('65693d3bd09cde779fae7c1d');
  });

  it('should return updated user information when user exists and update info is valid', async () => {
    const userId = '65693d3bd09cde779fae7c1d';
    const mockUser = {
      _id: '65693d3bd09cde779fae7c1d',
      nickname: 'testUser',
      firstName: 'Test',
      lastName: 'User',
      description: 'A test user',
      userAvatar: {
        imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
        imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
        imageType: PhotoType.USER,
        uploadUserId: '65693d3bd09cde779fae7c1d',
        _id: '65693d3bd09cde779fae7c1d',
      },
    };
    const updateUserDto = {
      nickname: 'updatedTestUser',
      firstName: 'Updated',
      lastName: 'User',
      description: 'An updated test user',
    };
    const mockUpdatedUser = {
      _id: '65693d3bd09cde779fae7c1d',
      nickname: 'updatedTestUser',
      firstName: 'Updated',
      lastName: 'User',
      description: 'An updated test user',
      userAvatar: {
        imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
        imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
        imageType: PhotoType.USER,
        uploadUserId: '65693d3bd09cde779fae7c1d',
        _id: '65693d3bd09cde779fae7c1d',
      },
    };

    jest.spyOn(userModel, 'findById').mockReturnValueOnce({ exec: () => mockUser } as any);

    const mockUserModelFindByIdAndUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(mockUpdatedUser);

    const result = await service.updateUser(userId, updateUserDto, null);

    expect(mockUserModelFindByIdAndUpdate).toHaveBeenCalledWith(
      '65693d3bd09cde779fae7c1d',
      {
        nickname: 'updatedTestUser',
        firstName: 'Updated',
        lastName: 'User',
        description: 'An updated test user',
        userAvatar: {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.USER,
          uploadUserId: '65693d3bd09cde779fae7c1d',
          _id: '65693d3bd09cde779fae7c1d',
        },
      },
      { new: true }
    );

    expect(result).toEqual(mockUpdatedUser);
  });

  it('should update user avatar information when avatar upload is successful', async () => {
    const userId = '65693d3bd09cde779fae7c1d';
    const mockUser = {
      _id: '65693d3bd09cde779fae7c1d',
      nickname: 'testUser',
      firstName: 'Test',
      lastName: 'User',
      description: 'A test user',
      userAvatar: [
        {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 0',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237440',
          imageType: PhotoType.USER,
          uploadUserId: '65693d3bd09cde779fae7c1d',
          _id: '65693d3bd09cde779fae7c1d',
        },
      ],
    };
    const mockUpdatedUser = {
      _id: '65693d3bd09cde779fae7c1d',
      nickname: 'updateUser',
      firstName: 'Update',
      lastName: 'User',
      description: 'An updated user',
      userAvatar: {
        imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 1',
        imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
        imageType: PhotoType.USER,
        uploadUserId: '65693d3bd09cde779fae7c1d',
        _id: '65693d3bd09cde779fae7c11',
      },
    };

    const mockUpdatedUserDto = {
      nickname: 'updateUser',
      firstName: 'Update',
      description: 'An updated user',
    };

    const mockAvatarFile = {
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('fake image data', 'utf-8'),
      originalname: 'avatar.jpg',
      encoding: 'encoding',
    };

    const mockUploadResult = [
      {
        data: {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 1',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
          imageType: PhotoType.USER,
          uploadUserId: '65693d3bd09cde779fae7c1d',
          _id: '65693d3bd09cde779fae7c11',
        },
      },
    ];

    const mockUserModelFindById = jest
      .spyOn(userModel, 'findById')
      .mockReturnValueOnce({ exec: () => mockUser } as any);

    const mockFileUploadServiceUploadPhoto = jest
      .spyOn(fileUploadService, 'uploadPhoto')
      .mockResolvedValueOnce(mockUploadResult);

    const mockUserModelfindByIdAndUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockResolvedValueOnce(mockUpdatedUser);

    const result = await service.updateUser(userId, mockUpdatedUserDto, mockAvatarFile);

    expect(mockUserModelFindById).toBeCalledWith('65693d3bd09cde779fae7c1d');
    expect(mockFileUploadServiceUploadPhoto).toBeCalledWith(
      '65693d3bd09cde779fae7c1d',
      [
        {
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('fake image data', 'utf-8'),
          originalname: 'avatar.jpg',
          encoding: 'encoding',
        },
      ],
      PhotoType.USER
    );
    expect(mockUserModelfindByIdAndUpdate).toBeCalledWith(
      '65693d3bd09cde779fae7c1d',
      {
        nickname: 'updateUser',
        firstName: 'Update',
        description: 'An updated user',
        userAvatar: {
          imageAlt: 'Attraction 65573aecb5ccb958b78ee5fa review photo 1',
          imageUrl: 'https://loremflickr.com/640/480/attraction?lock=7208175602237441',
          imageType: PhotoType.USER,
          uploadUserId: '65693d3bd09cde779fae7c1d',
          _id: '65693d3bd09cde779fae7c11',
        },
      },
      { new: true }
    );

    expect(result).toEqual(mockUpdatedUser);
  });
});
