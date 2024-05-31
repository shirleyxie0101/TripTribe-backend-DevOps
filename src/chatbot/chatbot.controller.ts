import { Controller, Get, Post, Body, UseInterceptors, Res } from '@nestjs/common';
import { Response } from 'express';

import { StreamInterceptor } from '@/utils/stream.interceptor';

import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller({ path: 'chatbot', version: '1' })
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Get()
  getHello(): string {
    return this.chatbotService.getHello();
  }

  // non-streaming api
  @Post('chat')
  async chat(@Body() chatMessageDto: ChatMessageDto) {
    const message = chatMessageDto.messages[0].text;
    return this.chatbotService.chat(message);
  }

  /**
   * steaming api
   * inluding `@Res() response: Response` in the argument is to tell NestJS that we want to handle the response ourselves,
   * otherwise NestJS will handle the response automatically and this will run into conflicts with the logic in StreamInterceptor
   */
  @Post('chat-stream')
  @UseInterceptors(StreamInterceptor)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async chatStream(@Body() chatMessageDto: ChatMessageDto, @Res() response: Response) {
    // ! not sure why this leads to error
    const message = chatMessageDto.messages[0].text;
    return this.chatbotService.chatStream(message);
  }
}
