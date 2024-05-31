import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

describe('UserService.createUser', () => {
  let service: UserService;
  let userModel: jest.Mocked<Model<User>>;

  beforeEach(async () => {
    class MockUserModel {
      constructor(public data: any) {}

      static findOne = jest.fn();
      static find = jest.fn();
      static create = jest.fn();

      save = jest.fn().mockResolvedValue(this.data);
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        FileUploadService,
        JwtService,
        ConfigService,
        {
          provide: getModelToken('User'),
          useValue: MockUserModel,
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
    userModel = module.get<any>(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user if email does not exist', async () => {
    const createUserDto = {
      email: 'newuser@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockUser = {
      email: 'newuser@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
      nickname: 'newuser',
    };

    jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(userModel, 'find').mockResolvedValueOnce([]); // mock not exist the same nickname user
    jest.spyOn(userModel, 'create').mockResolvedValueOnce(mockUser as any); //mock create user

    const result = await service.create(createUserDto as any);

    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
    expect(userModel.find).toHaveBeenCalledWith({ nickname: 'newuser' });
    expect(result).toEqual(
      expect.objectContaining({
        email: 'newuser@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        nickname: 'newuser',
      })
    );
  });

  it('should throw a ConflictException if user already exists', async () => {
    const createUserDto = {
      email: 'existinguser@example.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    };

    jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(createUserDto as any); // mock find out the exist user

    await expect(service.create(createUserDto as any)).rejects.toThrow(ConflictException);
  });
});
