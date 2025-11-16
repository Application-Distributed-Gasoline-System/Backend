import type { Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Controller, Get, Logger, Module, Res, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config';
import { Registry, collectDefaultMetrics } from 'prom-client';
const register = new Registry();

collectDefaultMetrics({ register });
@Controller()
class HealthMetricsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'fuel-ms', timestamp: new Date() };
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
      package: 'fuel',
      protoPath: join(__dirname, '../../proto/fuel.proto'),
      url: `${envs.host}:${envs.port}`,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.startAllMicroservices();
  await app.listen(3004);

  logger.log(`Fuel microservice listening via gRPC (${envs.host}:${envs.port}) and NATS`);

  const httpApp = await NestFactory.create(HealthMetricsModule);
  await httpApp.listen(9106, '0.0.0.0');
  console.log(`📊 Metrics + Health HTTP server on port 9106`);
}
bootstrap();
