import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { customOperationSorter } from './utils/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN');

  // enable cors
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  // enable dto validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // enable exception filter
  app.useGlobalFilters(new AllExceptionsFilter());
  // enable response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // enable swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      operationsSorter: customOperationSorter,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
