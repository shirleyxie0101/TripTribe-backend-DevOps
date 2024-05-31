import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';
import { FakerService } from '@/faker/faker.service';

async function generateFakeData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const fakerService = app.get(FakerService);

  await fakerService.generateFakeData();

  await app.close();
}

generateFakeData();
