import { IsMongoId } from 'class-validator';

export class QueryReviewDto {
  @IsMongoId()
  id: string;
}
