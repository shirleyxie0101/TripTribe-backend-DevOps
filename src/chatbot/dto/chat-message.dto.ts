import { Type } from 'class-transformer';
import { IsString, ValidateNested, IsArray } from 'class-validator';

class Message {
  @IsString()
  role: string;

  @IsString()
  text: string;
}

export class ChatMessageDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];
}
