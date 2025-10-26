import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
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
      package: 'routes',
      protoPath: join(__dirname, '../../proto/routes.proto'),
      url: `${envs.host}:${envs.port}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.startAllMicroservices();
  await app.listen(3001);

  logger.log(`✅ Routes microservice listening via gRPC (${envs.host}:${envs.port}) and NATS`);

  //const httpApp = await NestFactory.create(HealthMetricsModule);
  //await httpApp.listen(9103, '0.0.0.0');
  //console.log(`📊 Metrics + Health HTTP server on port 9103`);

}
bootstrap();
