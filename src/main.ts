// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for your frontend
  app.enableCors({
    origin: ['https://your-frontend-domain.onrender.com', 'http://localhost:5173'],
    credentials: true,
  });
  
  // --- IMPORTANT: Bind to 0.0.0.0 and use the PORT environment variable ---
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // This line is critical
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();