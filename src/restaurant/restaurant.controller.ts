import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBodyOptions,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { RatingDistribution } from '@/attraction/types/interfaces/ratingDistribution.interface';
import { CurrentUser } from '@/auth/CurrentUser.decorator';
import { PlaceType } from '@/common/constant/place-type';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';
import { PaginationResult } from '@/dto/pagination-result.dto';
import { FileUploadDto } from '@/file/dto/file-upload.dto';
import { FileValidationInterceptor } from '@/file/file-validation.interceptor';
import { ReviewService } from '@/review/review.service';
import { ReviewCreator } from '@/review/types/interfaces/review-creator';
import { PhotoType } from '@/schema/photo.schema';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { GetRestaurantListInput } from './dto/filter-restaurant.dto';
import { RestaurantFindOneDto } from './dto/get-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantService } from './restaurant.service';
import { Restaurant, RestaurantFilterResult } from './schema/restaurant.schema';

@Controller({
  path: 'restaurants',
  version: '1',
})
@ApiTags('restaurants')
export class RestaurantController {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly reviewService: ReviewService
  ) {}

  @ApiOperation({
    summary: 'Get all Restaurants or get Restaurants by filter',
    description: 'Retrieve restaurants successfully',
  })
  @ApiResponse({ status: 200, description: 'Retrieve restaurants successfully' })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: GetRestaurantListInput): Promise<RestaurantFilterResult> {
    return this.restaurantService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a Restaurant', description: 'Retrieve a restaurant successfully' })
  @ApiParam({
    name: 'id',
    description: 'Restaurant Id',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Retrieve a restaurant successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant Not Found' })
  @Get(':id')
  async findOne(@Param() params: RestaurantFindOneDto): Promise<Restaurant> {
    return this.restaurantService.findOne(params.id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Restaurant',
    description: 'Create a new restaurant successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Restaurant data to create',
    schema: {
      type: 'object',
      required: ['name', 'description', 'email', 'phone'],
      properties: {
        name: { type: 'string', example: 'Denesik Route' },
        description: {
          type: 'string',
          example:
            'Pauper delectatio avaritia consectetur super vesco quasi vulticulus necessitatibus constans.',
        },
        website: {
          type: 'string',
          example: 'http://dimpled-housing.net',
        },
        email: {
          type: 'string',
          example: 'DenesikRoute13@gmail.com',
        },
        phone: {
          type: 'string',
          example: '(679) 497-4605 x3175',
        },
        openHours: {
          type: 'object',
          example: {
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
        },
        address: {
          type: 'object',
          example: {
            formattedAddress: '25474 Ratke Passage Suite 979',
            location: {
              lng: -140.1176,
              lat: -88.9277,
            },
          },
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'An array of images',
        },
      },
    },
  } as ApiBodyOptions)
  @ApiResponse({ status: 201, description: 'Create a new restaurant successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
  async create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() currentUser,
    @UploadedFiles() files?: FileUploadDto[]
  ): Promise<Restaurant> {
    const newRestaurant = plainToClass(CreateRestaurantDto, createRestaurantDto);
    return this.restaurantService.create(newRestaurant, currentUser._id, files);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Restaurant',
    description: 'Update a restaurant successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Restaurant Id',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiBody({
    description: 'Restaurant data to update',
    schema: {
      type: 'object',
      required: ['name', 'description', 'email', 'phone'],
      properties: {
        name: { type: 'string', example: 'Denesik Route' },
        description: {
          type: 'string',
          example:
            'Pauper delectatio avaritia consectetur super vesco quasi vulticulus necessitatibus constans.',
        },
        website: {
          type: 'string',
          example: 'http://dimpled-housing.net',
        },
        email: {
          type: 'string',
          example: 'DenesikRoute13@gmail.com',
        },
        phone: {
          type: 'string',
          example: '(679) 497-4605 x3175',
        },
        openHours: {
          type: 'object',
          example: {
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
        },
        address: {
          type: 'object',
          example: {
            formattedAddress: '25474 Ratke Passage Suite 979',
            location: {
              lng: -140.1176,
              lat: -88.9277,
            },
          },
        },
        photos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              imageAlt: { type: 'string' },
              imageUrl: { type: 'string' },
              imageType: { type: 'enum', enum: Object.values(PhotoType) },
              uploadUserId: { type: 'string' },
              _id: { type: 'string' },
            },
          },
          description: 'An array of photos',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'An array of images',
        },
      },
    },
  } as ApiBodyOptions)
  @ApiResponse({ status: 200, description: 'Update a restaurant successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
  async update(
    @Param() params: RestaurantFindOneDto,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() currentUser,
    @UploadedFiles() files?: FileUploadDto[]
  ): Promise<Restaurant> {
    const updateRestaurant = plainToClass(UpdateRestaurantDto, updateRestaurantDto);
    return this.restaurantService.update(params.id, updateRestaurant, currentUser._id, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param() params: RestaurantFindOneDto,
    @CurrentUser() currentUser
  ): Promise<Restaurant> {
    return this.restaurantService.remove(params.id, currentUser._id);
  }

  @Get(':id/rating-distributions')
  async getRestaurantRating(@Param() params: RestaurantFindOneDto): Promise<RatingDistribution[]> {
    return await this.restaurantService.findRestaurantRating(params.id);
  }

  @ApiOperation({
    summary: 'Find Reviews by Restaurant ID',
    description: 'Find all reviews by Restaurant ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Restaurant ID',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Find Reviews by Restaurant ID successfully' })
  @ApiResponse({ status: 404, description: 'Review Not Found' })
  @Get(':id/reviews')
  findReviewsByRestaurantId(
    @Param() params: RestaurantFindOneDto,
    @Query() query: GetDataListInput
  ): Promise<PaginationResult<ReviewCreator[]>> {
    return this.reviewService.findAllByPlaceTypeAndId(PlaceType.Restaurant, params.id, query);
  }
}
