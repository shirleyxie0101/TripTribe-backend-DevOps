import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { PlaceType } from '@/user/dto/save-place.dto';
import { User } from '@/user/schema/user.schema';
import { UserService } from '@/user/user.service';

describe('UserService.addSavedPlace', () => {
  let service: UserService;
  let userModel: Model<User>;
  let attractionModel: Model<Attraction>;
  let restaurantModel: Model<Restaurant>;
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
            populate: jest.fn(),
          },
        },
        {
          provide: getModelToken('Restaurant'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('Attraction'),
          useValue: {
            findById: jest.fn(),
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
    attractionModel = module.get<Model<Attraction>>(getModelToken('Attraction'));
    restaurantModel = module.get<Model<Restaurant>>(getModelToken('Restaurant'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add new Attraction to saved place', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [{ _id: '1', name: 'attraction1' } as unknown as Attraction],
      savedRestaurants: [],
    } as unknown as User;

    const mockNewAttraction = {
      _id: '2',
      name: 'attraction2',
    } as unknown as Attraction;

    const mockSaveAttractionDto = {
      placeId: '2',
      placeType: PlaceType.ATTRACTION,
    };

    jest.spyOn(attractionModel, 'findById').mockResolvedValueOnce(mockNewAttraction);
    const mockUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

    await service.addSavedPlace(mockUser, mockSaveAttractionDto);
    expect(mockUpdate).toBeCalledWith(
      'testUserId',
      { savedAttractions: [{ _id: '1', name: 'attraction1' }, '2'] },
      { new: true }
    );
  });

  it('should not be called anything if the attraction is already saved', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [{ _id: '1', name: 'attraction1' } as unknown as Attraction],
      savedRestaurants: [],
    } as unknown as User;

    const mockSaveAttractionDto = {
      placeId: '1',
      placeType: PlaceType.ATTRACTION,
    };

    const mockUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

    await service.addSavedPlace(mockUser, mockSaveAttractionDto);
    expect(mockUpdate).not.toBeCalled();
  });

  it('should throw NotFoundException when attraction not found', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [],
      savedRestaurants: [],
    } as unknown as User;

    const mockSaveAttractionDto = {
      placeId: '1',
      placeType: PlaceType.ATTRACTION,
    };

    jest.spyOn(attractionModel, 'findById').mockResolvedValueOnce(null);

    await expect(service.addSavedPlace(mockUser, mockSaveAttractionDto)).rejects.toThrow(
      new NotFoundException('Attraction not found')
    );
  });

  it('should add new Restaurant to saved place', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [],
      savedRestaurants: [{ _id: '1', name: 'restaurant1' } as unknown as Restaurant],
    } as unknown as User;

    const mockNewRestaurant = {
      _id: '2',
      name: 'restaurant2',
    } as unknown as Restaurant;

    const mockSaveRestaurantDto = {
      placeId: '2',
      placeType: PlaceType.RESTAURANT,
    };

    jest.spyOn(restaurantModel, 'findById').mockResolvedValueOnce(mockNewRestaurant);
    const mockUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

    await service.addSavedPlace(mockUser, mockSaveRestaurantDto);
    expect(mockUpdate).toBeCalledWith(
      'testUserId',
      { savedRestaurants: [{ _id: '1', name: 'restaurant1' }, '2'] },
      { new: true }
    );
  });

  it('should not be called anything if the restaurant is already saved', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [],
      savedRestaurants: [{ _id: '1', name: 'restaurant1' } as unknown as Restaurant],
    } as unknown as User;

    const mockSaveRestaurantDto = {
      placeId: '1',
      placeType: PlaceType.RESTAURANT,
    };

    const mockUpdate = jest
      .spyOn(userModel, 'findByIdAndUpdate')
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValueOnce(null) } as any);

    await service.addSavedPlace(mockUser, mockSaveRestaurantDto);
    expect(mockUpdate).not.toBeCalled();
  });

  it('should throw NotFoundException when restaurant not found', async () => {
    const mockUser = {
      _id: 'testUserId',
      email: 'testEmail',
      savedAttractions: [],
      savedRestaurants: [],
    } as unknown as User;

    const mockSaveRestaurantDto = {
      placeId: '1',
      placeType: PlaceType.RESTAURANT,
    };

    jest.spyOn(restaurantModel, 'findById').mockResolvedValueOnce(null);

    await expect(service.addSavedPlace(mockUser, mockSaveRestaurantDto)).rejects.toThrow(
      new NotFoundException('Restaurant not found')
    );
  });
});
