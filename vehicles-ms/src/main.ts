import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { envs } from './config';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'vehicles', 
      protoPath: join(process.cwd(), 'proto/vehicles.proto'),
      url: `${envs.host}:${envs.port}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen();
  logger.log(`Microservicio gRPC de Vehicles ejecutándose en: ${envs.host}:${envs.port}`);
}

bootstrap();
