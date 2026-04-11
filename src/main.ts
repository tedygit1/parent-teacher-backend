import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for your frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // CRITICAL: Bind to 0.0.0.0 and use PORT environment variable
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Application running on port ${port}`);
}
bootstrap();
