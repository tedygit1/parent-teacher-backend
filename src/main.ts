import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for your frontend
  app.enableCors({
    origin: true, // Allow all origins for testing (your friend can use any frontend URL)
    credentials: true,
  });
  
  // --- CRITICAL FIX: Bind to 0.0.0.0 and use PORT environment variable ---
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // This line is the key fix
  console.log(`✅ Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
