import { VersioningType, ValidationPipe, RequestMethod } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './utils/allExceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // sentry.io setup
  if (configService.get('env') === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'production' ? false : true,
      environment: process.env.NODE_ENV,
      release: 'release_one',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.GraphQL(),
        new Sentry.Integrations.Apollo({ useNestjs: true }),
      ],
    });
    // The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }

  // setup helmet
  app.use(
    helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false })
  );

  // setup cors
  app.enableCors();

  // setup global validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // set global REST api prefix
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health-check', method: RequestMethod.GET }],
  });

  // enable REST api version
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // setup swagger module for document generation
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('TripTribe Backend API')
    .setDescription('This is TripTribe Backend APIs document')
    .setVersion('1.0')
    .addTag('TripTribe Backend')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // setup GraphQL API file upload service
  app.use('/graphql', graphqlUploadExpress(configService.get('uploader.middleware')));

  if (configService.get('env') === 'production') {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());
  }

  // setup global exception filter for Http requests
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(process.env.PORT || 8080);
}

bootstrap();
