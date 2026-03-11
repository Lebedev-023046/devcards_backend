import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Use ConfigService for consistency and provide a fallback for CORS
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN') || '*';
  const port = config.get<number>('PORT') || 3000;

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
