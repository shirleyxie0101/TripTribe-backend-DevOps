import { Injectable } from '@nestjs/common';

import { AttractionService } from '@/attraction/attraction.service';
import { RestaurantService } from '@/restaurant/restaurant.service';

import { GlobalSearchDto, PlaceType } from './dto/globalSearch.dto';
import { IGlobalSearch } from './type/interfaces/globalSearch.do';
import { IResultWithType } from './type/interfaces/resultWithType.do';

@Injectable()
export class SearchService {
  constructor(
    private restaurantService: RestaurantService,
    private attractionService: AttractionService
  ) {}

  async globalSearch(searchInfoDto: GlobalSearchDto): Promise<IGlobalSearch> {
    const restaurantsSearchResult = await this.restaurantService.findByKeyword(searchInfoDto);
    const attractionsSearchResult = await this.attractionService.findByKeyword(searchInfoDto);
    const restaurants: IResultWithType[] = restaurantsSearchResult.map((restaurant) => {
      return {
        ...restaurant,
        type: PlaceType.RESTAURANT,
      };
    });

    const attractions: IResultWithType[] = attractionsSearchResult.map((attraction) => {
      return {
        ...attraction,
        type: PlaceType.ATTRACTION,
      };
    });

    const globalSearchResult: IGlobalSearch = [...restaurants, ...attractions];

    return globalSearchResult;
  }
}
