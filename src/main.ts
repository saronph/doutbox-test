import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'swagger';
import { DataSource } from 'typeorm';
import { seedAdmin } from 'scripts/createAdmin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  const dataSource = app.get(DataSource);
  await seedAdmin(dataSource);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
