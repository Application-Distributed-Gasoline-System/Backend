import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_SERVERS || 'nats://nats-server:4222'],
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'drivers',
      protoPath: join(__dirname, '../../proto/drivers.proto'),
      url: `${envs.host}:${envs.port}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.startAllMicroservices();
  await app.listen(3001);

  logger.log(`✅ Drivers microservice listening via gRPC (${envs.host}:${envs.port}) and NATS`);
}

bootstrap();
