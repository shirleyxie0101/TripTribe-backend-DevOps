import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { StreamInterceptor } from '@/utils/stream.interceptor';

import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, StreamInterceptor, Reflector],
})
export class ChatbotModule {}
