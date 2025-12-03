import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, Res, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { Controller, Get, Module } from '@nestjs/common';
import type { Response } from 'express';
const register = new Registry();

collectDefaultMetrics({ register });

@Controller()
class HealthMetricsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'drivers-ms', timestamp: new Date() };
  }

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(metrics);
  }
}

@Module({
  controllers: [HealthMetricsController],
})
class HealthMetricsModule { }
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

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  await app.startAllMicroservices();
  await app.listen(3001);

  logger.log(`✅ Drivers microservice listening via gRPC (${envs.host}:${envs.port}) and NATS`);

  const httpApp = await NestFactory.create(HealthMetricsModule);
  await httpApp.listen(9103, '0.0.0.0');
  console.log(`📊 Metrics + Health HTTP server on port 9103`);

}

bootstrap();
