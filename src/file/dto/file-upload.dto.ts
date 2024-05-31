import { IsString, IsNotEmpty, IsNumber, IsMimeType } from 'class-validator';

export class FileUploadDto {
  @IsString()
  public originalname!: string;

  @IsString()
  @IsMimeType()
  public mimetype!: string;

  @IsString()
  public encoding!: string;

  @IsNumber()
  @IsNotEmpty()
  public size: number;

  @IsNotEmpty()
  public buffer: Buffer;
}
