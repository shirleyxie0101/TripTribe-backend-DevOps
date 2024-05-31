import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
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

import { Attraction, AttractionFilterResult } from '@/attraction/schema/attraction.schema';
import { CurrentUser } from '@/auth/CurrentUser.decorator';
import { Permission } from '@/common/constant/permission.constant';
import { PlaceType } from '@/common/constant/place-type';
import { GetDataListInput } from '@/dto/getDatatListInput.dto';
import { PaginationResult } from '@/dto/pagination-result.dto';
import { FileUploadDto } from '@/file/dto/file-upload.dto';
import { FileValidationInterceptor } from '@/file/file-validation.interceptor';
import { Permissions } from '@/permission-group/permissions.decorator';
import { PermissionsGuard } from '@/permission-group/permissions.guard';
import { ReviewService } from '@/review/review.service';
import { ReviewCreator } from '@/review/types/interfaces/review-creator';
import { PhotoType } from '@/schema/photo.schema';

import { AttractionService } from './attraction.service';
import { CreateAttractionDto } from './dto/create-attraction.dto';
import { GetAttractionListInput } from './dto/filter-attraction.dto';
import { AttractionFindOneDto } from './dto/get-attraction.dto';
import { UpdateAttractionDto } from './dto/update-attraction.dto';
import { RatingDistribution } from './types/interfaces/ratingDistribution.interface';

@Controller({
  path: 'attractions',
  version: '1',
})
@ApiTags('attractions')
export class AttractionController {
  constructor(
    private readonly attractionService: AttractionService,
    private readonly reviewService: ReviewService
  ) {}

  @ApiOperation({
    summary: 'Get an attraction',
    description: 'Retrieve an attraction successfully',
  })
  @ApiParam({
    name: 'id',
    description: 'Attraction Id',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Retrieve an attraction successfully' })
  @ApiResponse({ status: 404, description: 'Attraction Not Found' })
  @Get(':id')
  async findOne(@Param() params: AttractionFindOneDto): Promise<Attraction> {
    return this.attractionService.findOne(params.id);
  }

  @ApiOperation({
    summary: 'Get all Attractions or get Attractions by filter',
    description: 'Retrieve all attractions successfully',
  })
  @ApiResponse({ status: 200, description: 'Retrieve attractions successfully' })
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: GetAttractionListInput): Promise<AttractionFilterResult> {
    return this.attractionService.findAll(query);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Attraction',
    description: 'Create a new attraction successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Attraction data to create',
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
  @ApiResponse({ status: 201, description: 'Create a new attraction successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions(Permission.ATTRACTION_CREATE)
  @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
  async create(
    @CurrentUser() currentUser,
    @Body() createAttractionDto: CreateAttractionDto,
    @UploadedFiles() files: FileUploadDto[]
  ): Promise<Attraction> {
    const userId = currentUser._id;
    const attractionDto = plainToClass(CreateAttractionDto, createAttractionDto);
    return await this.attractionService.create(userId, attractionDto, files);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Attraction',
    description: 'Update an attraction successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Attraction Id',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiBody({
    description: 'Attraction data to update',
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
  @ApiResponse({ status: 200, description: 'Update an attraction successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @UseInterceptors(FilesInterceptor('files', 10), FileValidationInterceptor)
  async updateAttraction(
    @Param() params: AttractionFindOneDto,
    @CurrentUser() currentUser,
    @UploadedFiles() files: FileUploadDto[],
    @Body() updateAttractionDto: UpdateAttractionDto
  ): Promise<Attraction> {
    const attractionDto = plainToClass(UpdateAttractionDto, updateAttractionDto);
    return await this.attractionService.updateAttraction(
      params.id,
      files,
      attractionDto,
      currentUser._id
    );
  }

  @Get(':id/rating-distributions')
  async getAttractionRating(@Param() params: AttractionFindOneDto): Promise<RatingDistribution[]> {
    return await this.attractionService.findAttractionRating(params.id);
  }

  @ApiOperation({
    summary: 'Find Reviews by Attraction ID',
    description: 'Find all reviews by Attraction ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Attraction ID',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({ status: 200, description: 'Find Reviews by Attraction ID successfully' })
  @ApiResponse({ status: 404, description: 'Review Not Found' })
  @Get(':id/reviews')
  findReviewsByAttractionId(
    @Param() params: AttractionFindOneDto,
    @Query() query: GetDataListInput
  ): Promise<PaginationResult<ReviewCreator[]>> {
    return this.reviewService.findAllByPlaceTypeAndId(PlaceType.Attraction, params.id, query);
  }
}
