import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { Attraction, AttractionSchema } from '@/attraction/schema/attraction.schema';
import { FileUploadModule } from '@/file/file.module';
import { Restaurant, RestaurantSchema } from '@/restaurant/schema/restaurant.schema';
import { ReviewModule } from '@/review/review.module';

import { User, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Attraction.name, schema: AttractionSchema },
    ]),
    FileUploadModule,
    forwardRef(() => ReviewModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
