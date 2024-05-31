import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  getHello(): string {
    return 'Hello World from chatbot service!';
  }

  async chat(message: string): Promise<{ text: string }> {
    // Sends response back to Deep Chat using the Response format: https://deepchat.dev/docs/connect/#Response
    return {
      text: `This is a respone from a NestJs server. Thankyou for your message - ${message}`,
    };
  }

  async chatStream(message: string): Promise<string> {
    // this string will be converted to stream in the interceptor
    return `This is a response from a NestJs server. Thank you for your message - ${message}!`;
  }
}
