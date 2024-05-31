import { Module } from '@nestjs/common';

import { AttractionModule } from '@/attraction/attraction.module';
import { RestaurantModule } from '@/restaurant/restaurant.module';

import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [AttractionModule, RestaurantModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
