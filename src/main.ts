import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  
  // Enable CORS for your specific frontend URLs
  app.enableCors({
    origin: [
      'http://localhost:3000',                    // Your local frontend
      'https://parent-teacher-app-5cdn.vercel.app', // Your production frontend
      'http://localhost:3001',                    // Alternative local port (if needed)
      'https://parent-teacher-app.vercel.app',    // Potential custom domain
    ],
    credentials: true,              // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,      // For legacy browsers
    preflightContinue: false,
  });
  
  // --- CRITICAL FIX: Bind to 0.0.0.0 and use PORT environment variable ---
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // This line is the key fix
  console.log(✅ Application is running on: http://0.0.0.0:${port});
  console.log(📍 CORS enabled for: http://localhost:3000, https://parent-teacher-app-5cdn.vercel.app);
=======

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
>>>>>>> 9ce5b0fb54664580ecffb4b75f8fcb5d816eca49
}

bootstrap();