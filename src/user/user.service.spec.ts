import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';

import { SavePlaceDto } from './dto/save-place.dto';
import { User } from './schema/user.schema';
import { UserService } from './user.service';

// import { SavePlaceDto } from './dto/save-place.dto';

//  BadRequestException
interface IUser {
  _id: string;
  savedAttractions?: string[];
  savedRestaurants?: string[];
}

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let restaurantModel: Model<Restaurant>;
  let attractionModel: Model<Attraction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        FileUploadService,
        ConfigService,
        {
          provide: getModelToken(User.name),
          useValue: {
            exec: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken('Photo'),
          useValue: {},
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
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    restaurantModel = module.get<Model<Restaurant>>(getModelToken(Restaurant.name));
    attractionModel = module.get<Model<Attraction>>(getModelToken(Attraction.name));
  });
  describe('UserService - error handling', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw NotFoundException for Restaurant type when place not in Restaurant model', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Restaurant',
        placeId: '6569d020848805cd35e9c2ab',
      };

      jest.spyOn(restaurantModel, 'findById').mockResolvedValueOnce(null);

      await expect(service.addSavedPlace(mockCurrentUser, mockSavePlaceDto)).rejects.toThrowError(
        NotFoundException
      );
      await expect(service.addSavedPlace(mockCurrentUser, mockSavePlaceDto)).rejects.toThrowError(
        /Restaurant not found/
      );
    });

    it('should throw NotFoundException for Attraction type when place not in Attraction model', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Attraction',
        placeId: '6569d020848805cd35e9c2ab',
      };

      jest.spyOn(restaurantModel, 'findById').mockResolvedValueOnce(null);

      // Expect the NotFoundException to be thrown
      await expect(service.addSavedPlace(mockCurrentUser, mockSavePlaceDto)).rejects.toThrowError(
        NotFoundException
      );
      await expect(service.addSavedPlace(mockCurrentUser, mockSavePlaceDto)).rejects.toThrowError(
        /Attraction not found/
      );
    });
  });

  describe('UserService - normal', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be able to add Restaurant when there is no savedRestaurant field in User', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Restaurant',
        placeId: '6569d020848805cd35e9c2ab',
      };

      const mockResult: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9c2ab'],
      };

      jest
        .spyOn(restaurantModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);

      const mockUserModelFindByIdAndUpdate = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => mockResult } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(restaurantModel.findById).toBeCalledWith('6569d020848805cd35e9c2ab');

      expect(mockUserModelFindByIdAndUpdate).toBeCalledWith(
        '6557e818fb2bab29769c07a2',
        {
          savedRestaurants: ['6569d020848805cd35e9c2ab'],
        },
        { new: true }
      );
    });

    it('should be able to add Attractions when there is no savedAttraction field in User', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Attraction',
        placeId: '6569d020848805cd35e9c2ab',
      };

      const mockResult: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['6569d020848805cd35e9c2ab'],
        savedRestaurants: ['6569d020848805cd35e9c2ab'],
      };

      jest
        .spyOn(attractionModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);

      const mockUserModelFindByIdAndUpdate = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => mockResult } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(attractionModel.findById).toBeCalledWith('6569d020848805cd35e9c2ab');

      expect(mockUserModelFindByIdAndUpdate).toBeCalledWith(
        '6557e818fb2bab29769c07a2',
        {
          savedAttractions: ['6569d020848805cd35e9c2ab'],
        },
        { new: true }
      );
    });

    it('should add a place to SavedRestaurants when placeType is Restaurant and place exists', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Restaurant',
        placeId: '6569d020848805cd35e9c2ab',
      };

      const mockResult: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a', '6569d020848805cd35e9c2ab'],
      };

      jest
        .spyOn(restaurantModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);

      const mockUserModelFindByIdAndUpdate = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => mockResult } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(restaurantModel.findById).toBeCalledWith('6569d020848805cd35e9c2ab');

      expect(mockUserModelFindByIdAndUpdate).toBeCalledWith(
        '6557e818fb2bab29769c07a2',
        {
          savedRestaurants: ['6569d020848805cd35e9ce1a', '6569d020848805cd35e9c2ab'],
        },
        { new: true }
      );
    });

    it('should add a place to SavedAttractions when placeType is Attraction and place exists', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Attraction',
        placeId: '6569d020848805cd35e9c2ab',
      };

      const mockResult: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: [
          '655c8a397c040537cf437248',
          '655c8b6f7c040537cf43725a',
          '6569d020848805cd35e9c2ab',
        ],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };

      jest
        .spyOn(attractionModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);

      const mockSavedAttractionsService = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => mockResult } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(attractionModel.findById).toBeCalledWith('6569d020848805cd35e9c2ab');

      expect(mockSavedAttractionsService).toBeCalledWith(
        '6557e818fb2bab29769c07a2',
        {
          savedAttractions: [
            '655c8a397c040537cf437248',
            '655c8b6f7c040537cf43725a',
            '6569d020848805cd35e9c2ab',
          ],
        },
        { new: true }
      );
    });

    it('should be able to add Restaurant twice when Restaurant already exists in user savedRestaurants ', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Restaurant',
        placeId: '6569d020848805cd35e9ce1a',
      };

      jest
        .spyOn(restaurantModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);
      const mockUpdateMethod = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => null } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(mockUpdateMethod).not.toHaveBeenCalled();
    });

    it('should be able to add Attraction twice when Attraction already exists in user savedAttractions ', async () => {
      const mockCurrentUser: IUser = {
        _id: '6557e818fb2bab29769c07a2',
        savedAttractions: ['655c8a397c040537cf437248', '655c8b6f7c040537cf43725a'],
        savedRestaurants: ['6569d020848805cd35e9ce1a'],
      };
      const mockSavePlaceDto: SavePlaceDto = {
        placeType: 'Attraction',
        placeId: '655c8b6f7c040537cf43725a',
      };

      jest
        .spyOn(attractionModel, 'findById')
        .mockResolvedValueOnce({ _id: mockSavePlaceDto.placeId } as any);
      const mockUpdateMethod = jest
        .spyOn(userModel, 'findByIdAndUpdate')
        .mockReturnValueOnce({ exec: () => null } as any);

      await service.addSavedPlace(mockCurrentUser, mockSavePlaceDto);

      expect(mockUpdateMethod).not.toHaveBeenCalled();
    });
  });
});
