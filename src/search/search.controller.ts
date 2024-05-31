import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';

import { GlobalSearchDto } from './dto/globalSearch.dto';
import { SearchService } from './search.service';
import { IGlobalSearch } from './type/interfaces/globalSearch.do';

@Controller({
  path: 'search',
  version: '1',
})
@ApiTags('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiOperation({
    summary: 'Global search',
    description: 'Retrieve search result successfully',
  })
  @ApiBody({
    type: GlobalSearchDto,
    description: 'Search keyword and information',
  })
  @ApiResponse({ status: 201, description: 'Search successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Post('globalSearch')
  globalSearch(@Body() searchInfo: GlobalSearchDto): Promise<IGlobalSearch> {
    const searchInfoDto = plainToClass(GlobalSearchDto, searchInfo);

    return this.searchService.globalSearch(searchInfoDto);
  }
}
