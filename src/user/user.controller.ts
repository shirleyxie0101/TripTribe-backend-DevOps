import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Post,
  HttpCode,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { Multer } from 'multer';

import { Attraction } from '@/attraction/schema/attraction.schema';
import { CurrentUser } from '@/auth/CurrentUser.decorator';
import { FindOneDto } from '@/dto/find-one.dto';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';
import { PaginationResult } from '@/dto/pagination-result.dto';
import { Restaurant } from '@/restaurant/schema/restaurant.schema';
import { UserReview } from '@/review/dto/user-review.dto';
import { ReviewService } from '@/review/review.service';

import { deleteSavedPlaceDto } from './dto/delete-save-place.dto';
import { EditPasswordDto } from './dto/edit-password.dto';
import { getSavedPlaceDto } from './dto/get-saved-place.dto';
import { SavePlaceDto } from './dto/save-place.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { UserService } from './user.service';

@Controller({
  path: 'users',
  version: '1',
})
@ApiTags('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly reviewService: ReviewService
  ) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get me', description: 'Retrieve me successfully' })
  @ApiResponse({ status: 200, description: 'Retrieve me successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser() currentUser): User {
    return this.userService.getMe(currentUser);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an user', description: 'Retrieve an user successfully' })
  @ApiParam({
    name: 'id',
    description: 'User Id',
    required: true,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Retrieve an user by ID successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(AuthGuard('jwt'))
  async find(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post('me/saves')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Place saved successfully' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(201)
  @ApiBody({
    description: 'add save places',
    schema: {
      type: 'object',
      required: ['placeId', 'placeType'],
      properties: {
        placeId: { type: 'string', example: '657256dff1fc083b3fe4177d' },
        placeType: { type: 'string', example: 'Attraction' },
      },
    },
  })
  create(@CurrentUser() currentUser, @Body() savePlaceDto: SavePlaceDto): Promise<void> {
    return this.userService.addSavedPlace(currentUser, savePlaceDto);
  }

  @Get(':id/saves/:placeType')
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Get saved places successfully' })
  @ApiParam({
    name: 'id',
    description: 'User Id',
    required: true,
    type: String,
  })
  @ApiParam({
    name: 'placeType',
    description: 'Place type',
    required: true,
    type: getSavedPlaceDto['placeType'],
  })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async getSavedPlaces(
    @CurrentUser() currentUser,
    @Param('id') id: string,
    @Param('placeType') placeType: getSavedPlaceDto['placeType']
  ): Promise<Attraction[] | Restaurant[]> {
    return this.userService.getSavedPlaces(currentUser, id, placeType);
  }

  @Delete('me/saves/:placeType/:placeId')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Saves place deleted successfully' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @ApiParam({
    name: 'placeType',
    example: 'Restaurant',
    description: 'Type of the place (Restaurant or Attraction)',
  })
  @ApiParam({
    name: 'placeId',
    example: '65838511e76a894551c39d13',
    description: 'ID of the place to delete',
  })
  async deleteSavedPlace(
    @CurrentUser() currentUser,
    @Param('placeType') placeType: deleteSavedPlaceDto['placeType'],
    @Param('placeId') placeId: deleteSavedPlaceDto['placeId']
  ): Promise<{ savedRestaurants: Restaurant[] } | { savedAttractions: Attraction[] } | undefined> {
    const deleteSavedPlaceDto = { placeType, placeId };
    return this.userService.deleteSavedPlace(currentUser, deleteSavedPlaceDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    })
  )
  async updateProfile(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Multer.File
  ) {
    const updatedUserDto = plainToClass(UpdateUserDto, updateUserDto);
    return this.userService.updateUser(userId, updatedUserDto, avatar);
  }

  @ApiOperation({
    summary: 'Get all reviews by userId',
    description: 'Retrieve all reviews successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'User Id',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Retrieve all reviews successfully' })
  @ApiResponse({ status: 404, description: 'User Not Exists' })
  @Get(':id/reviews')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllReviewsByUserId(
    @Param() params: FindOneDto,
    @Query() query: GetDataListInput
  ): Promise<PaginationResult<UserReview>> {
    return this.reviewService.findAllByUserId(params.id, query);
  }

  @Put('me/password')
  @UseGuards(AuthGuard('jwt'))
  async editPassword(@CurrentUser() currentUser, @Body() params: EditPasswordDto) {
    const userId = currentUser._id;
    return await this.userService.editPassword(userId, params);
  }
}
