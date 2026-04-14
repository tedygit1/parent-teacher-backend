import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
}

bootstrap();