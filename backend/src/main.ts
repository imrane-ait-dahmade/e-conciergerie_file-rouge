/**
 * Point d'entrée de l'application NestJS.
 * Équivalent Laravel : public/index.php
 *
 * Configure : CORS, ValidationPipe (validation automatique des DTO),
 * Helmet (sécurité), Swagger (documentation API).
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet : politique cross-origin pour ne pas bloquer les réponses consommées par le front (autre port / domaine)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS : Next.js (web) + app mobile (Expo Metro / dev server, souvent :8081)
  const frontendUrl = (
    process.env.FRONTEND_URL ?? 'http://localhost:3001'
  ).replace(/\/$/, '');
  const mobileDevOrigin = (
    process.env.MOBILE_DEV_ORIGIN ?? 'http://localhost:8081'
  ).replace(/\/$/, '');
  const allowedOrigins = [
    ...new Set([
      frontendUrl,
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      mobileDevOrigin,
      'http://localhost:8081',
      'http://127.0.0.1:8081',
    ]),
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Request-Id',
      'X-Correlation-Id',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('E-Conciergerie API')
    .setDescription(
      'API documentation for E-Conciergerie backend. Auth endpoints support signup, login, email verification, password reset, and token refresh.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
