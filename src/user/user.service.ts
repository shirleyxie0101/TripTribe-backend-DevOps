import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compareSync } from 'bcryptjs';
import { Model } from 'mongoose';
import { Multer } from 'multer';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { AuthRegisterDto } from '@/auth/dto/auth-register.dto';
import { ResetPasswordDto } from '@/auth/dto/reset-password.dto';
import configuration from '@/config/configuration';
import { FileUploadService } from '@/file/file.service';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { PhotoType } from '@/schema/photo.schema';

import { deleteSavedPlaceDto } from './dto/delete-save-place.dto';
import { EditPasswordDto } from './dto/edit-password.dto';
import { getSavedPlaceDto } from './dto/get-saved-place.dto';
import { SavePlaceDto, PlaceType } from './dto/save-place.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdDto } from './dto/userId.dto';
import { User } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
    @InjectModel(Attraction.name) private attractionModel: Model<Attraction>,
    private fileUploadService: FileUploadService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  getMe(currentUser): User {
    return currentUser;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  async create(createUserDto: AuthRegisterDto): Promise<User> {
    // check if user already existed
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('user already exists');
    }

    const nicknameParts = createUserDto.email?.split('@');
    let nickname = nicknameParts ? nicknameParts[0] : '';

    const sameNicknameUser = await this.userModel.find({ nickname: nickname });
    if (sameNicknameUser.length > 0) {
      const similarNicknameUser = await this.userModel.find({
        nickname: { $regex: `^${nickname}#` },
      });
      const number = similarNicknameUser.length + 1;
      nickname = `${nickname}#${number}`;
    }

    const email = createUserDto.email;
    const emailToken = await this.generateEmailAccessToken(email);
    const newUser = new this.userModel({ ...createUserDto, nickname, emailToken });
    return newUser.save();
  }

  //generate email accessToken
  async generateEmailAccessToken(email: string): Promise<string> {
    const payload = { sub: email, iat: Math.floor(Date.now() / 1000) };
    const EMAIL_TOKEN_TIME = this.configService.get('auth.emailTokenExpiration');
    return this.jwtService.signAsync(payload, { expiresIn: EMAIL_TOKEN_TIME });
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    avatarFile: Multer.File
  ): Promise<User> {
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    let currentAvatar = existingUser.userAvatar;

    if (avatarFile) {
      const uploadResults = await this.fileUploadService.uploadPhoto(
        userId,
        [avatarFile],
        PhotoType.USER
      );

      currentAvatar = uploadResults.map((result) => result.data)[0];
    }

    const dataToUpdate = {
      ...updateUserDto,
      userAvatar: currentAvatar,
    };
    // using findOneAndUpdate update user date with photo change
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, dataToUpdate, { new: true });
    if (!updatedUser) {
      throw new BadRequestException('update operation failed');
    }
    return updatedUser;
  }

  async getSavedPlaces(
    currentUser: User,
    id: string,
    placeType: getSavedPlaceDto['placeType']
  ): Promise<Attraction[] | Restaurant[]> {
    const userId = id === 'me' ? currentUser._id : id;

    // Find the user and populate the relevant field based on placeType
    const poulateType =
      placeType === PlaceType.RESTAURANT ? 'savedRestaurants' : 'savedAttractions';
    const populatedUser = await this.userModel.findById(userId).populate(poulateType).exec();

    if (!populatedUser) {
      throw new BadRequestException('User not found.');
    }

    if (placeType === PlaceType.RESTAURANT) {
      return populatedUser.savedRestaurants;
    } else if (placeType === PlaceType.ATTRACTION) {
      return populatedUser.savedAttractions;
    } else {
      throw new BadRequestException(
        'Invalid placeType. PlaceType can only be "Restaurant" or "Attraction".'
      );
    }
  }

  async addSavedPlace(currentUser: User, savePlaceDto: SavePlaceDto): Promise<void> {
    const user = currentUser;
    let place;

    const savedAttractionIds = user.savedAttractions.map((attraction) => attraction._id.toString());
    const savedRestaurantIds = user.savedRestaurants.map((restaurant) => restaurant._id.toString());

    if (
      savedAttractionIds.includes(savePlaceDto.placeId) ||
      savedRestaurantIds.includes(savePlaceDto.placeId)
    ) {
      return;
    }

    if (savePlaceDto.placeType === PlaceType.RESTAURANT) {
      place = await this.restaurantModel.findById(savePlaceDto.placeId);
      if (!place) {
        throw new NotFoundException('Restaurant not found');
      }
      const newSavedList = [...user.savedRestaurants];
      newSavedList.push(place._id);
      const newUserData = { savedRestaurants: newSavedList };
      await this.userModel.findByIdAndUpdate(user['_id'], newUserData, { new: true }).exec();
      return;
    } else if (savePlaceDto.placeType === PlaceType.ATTRACTION) {
      place = await this.attractionModel.findById(savePlaceDto.placeId);
      if (!place) {
        throw new NotFoundException('Attraction not found');
      }
      const newSavedList = [...user.savedAttractions];
      newSavedList.push(place._id);
      const newUserData = { savedAttractions: newSavedList };
      await this.userModel.findByIdAndUpdate(user['_id'], newUserData, { new: true }).exec();
      return;
    }
  }

  async deleteSavedPlace(
    currentUser: User,
    deleteSavedPlaceDto: deleteSavedPlaceDto
  ): Promise<{ savedRestaurants: Restaurant[] } | { savedAttractions: Attraction[] } | undefined> {
    const user = currentUser;
    const savedAttractionIds = user.savedAttractions.map((attraction) => attraction._id.toString());
    const savedRestaurantIds = user.savedRestaurants.map((restaurant) => restaurant._id.toString());
    if (deleteSavedPlaceDto.placeType === PlaceType.RESTAURANT) {
      const placeIndex = savedRestaurantIds.indexOf(deleteSavedPlaceDto.placeId);
      if (placeIndex !== -1) {
        user.savedRestaurants.splice(placeIndex, 1);
        const newUserData = { savedRestaurants: user.savedRestaurants };
        await this.userModel.findByIdAndUpdate(user['_id'], newUserData, { new: true }).exec();
        return newUserData;
      }
      return;
    } else if (deleteSavedPlaceDto.placeType === PlaceType.ATTRACTION) {
      const placeIndex = savedAttractionIds.indexOf(deleteSavedPlaceDto.placeId);
      if (placeIndex !== -1) {
        user.savedAttractions.splice(placeIndex, 1);
        const newUserData = { savedAttractions: user.savedAttractions };
        await this.userModel.findByIdAndUpdate(user['_id'], newUserData, { new: true }).exec();
        return newUserData;
      }
      return;
    }
    throw new BadRequestException(
      'Invalid placeType. PlaceType can only be "Restaurant" or "Attraction".'
    );
  }

  async generateEmailValidateToken(email: string): Promise<string> {
    const payload = { sub: email };
    const ACCESS_TOKEN_TIME = '7d';
    return this.jwtService.signAsync(payload, { expiresIn: ACCESS_TOKEN_TIME });
  }

  async updatePassword(userId: string, newPassword: ResetPasswordDto) {
    const { newPassword: checkedNewpassword } = newPassword;
    const res = await this.userModel.updateOne(
      { _id: userId },
      { $set: { password: checkedNewpassword } },
      { new: true }
    );
    return res;
  }

  async editPassword(userId: UserIdDto['_id'], editPasswordDto: EditPasswordDto) {
    const existingUser = await this.userModel.findById(userId).select('+password');
    if (!existingUser) {
      throw new BadRequestException(`User with ID ${userId.toString()} not found`);
    }
    const { oldPassword, newPassword } = editPasswordDto;

    if (!compareSync(oldPassword, existingUser.password)) {
      throw new BadRequestException('Your old password is incorrect.');
    }
    const editedUser = await this.updatePassword(userId, { newPassword });
    return editedUser;
  }
}
