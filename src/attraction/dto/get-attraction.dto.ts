import { IsMongoId } from 'class-validator';

export class AttractionFindOneDto {
  @IsMongoId()
  id: string;
}
