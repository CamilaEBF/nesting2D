import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Habilitar ValidationPipe global como fallback
  // (el controlador ya tiene su propio ValidationPipe configurado)
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

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Nesting 2D API corriendo en: http://localhost:${port}`);
  logger.log(`📐 Endpoint: POST http://localhost:${port}/api/v1/nesting/calculate`);
}
await bootstrap();
