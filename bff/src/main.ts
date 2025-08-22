import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS para desarrollo
  app.enableCors({
    origin: ['http://localhost:5173', 'http://ta-frontend:5173'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 BFF service running on port ${port}`);
}
bootstrap();
