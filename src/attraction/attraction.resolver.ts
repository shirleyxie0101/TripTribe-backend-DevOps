import { UseFilters } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { HttpExceptionFilter } from '@/utils/allExceptions.filter';

import { AttractionService } from './attraction.service';
import { GetAttractionListInput } from './dto/filter-attraction.dto';
import { Attraction, AttractionFilterResult } from './schema/attraction.schema';

@Resolver(() => Attraction)
@UseFilters(HttpExceptionFilter)
export class AttractionResolver {
  constructor(private readonly attractionService: AttractionService) {}

  @Query(() => AttractionFilterResult, {
    description: 'Get all attractions or get attractions by filter',
  })
  async getAllAttractions(
    @Args('input') input: GetAttractionListInput
  ): Promise<AttractionFilterResult> {
    return this.attractionService.findAll(input);
  }
}
