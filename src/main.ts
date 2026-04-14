import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ✅ Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Parent Teacher API')
    .setDescription('API documentation for Parent-Teacher System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger endpoint
  SwaggerModule.setup('api', app, document);

  // ✅ IMPORTANT FIX: force number + Render compatibility
  const port = parseInt(process.env.PORT || '3000', 10);

  // ✅ IMPORTANT FIX: bind correctly for Render
  await app.listen(port);

  // ✅ FIX LOGS (use real deployed URL, not localhost)
  console.log(`✅ Application running on port ${port}`);
  console.log(`📘 Swagger docs available at /api`);
}

bootstrap();