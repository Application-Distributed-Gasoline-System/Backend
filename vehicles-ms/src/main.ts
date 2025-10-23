import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, Res, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { envs } from './config';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { Controller, Get, Module } from '@nestjs/common';
import type { Response } from 'express';
dotenv.config();
const register = new Registry();
collectDefaultMetrics({ register });

@Controller()
class HealthMetricsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'vehicles-ms', timestamp: new Date() };
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

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'vehicles',
      protoPath: join(__dirname, '../../proto/vehicles.proto'),
      url: `${envs.host}:${envs.port}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen();
  logger.log(`Microservicio gRPC de Vehicles ejecutándose en: ${envs.host}:${envs.port}`);

  const httpApp = await NestFactory.create(HealthMetricsModule);
  await httpApp.listen(9104, '0.0.0.0');
  console.log(`📊 Metrics + Health HTTP server on port 9104`);
}

bootstrap();
