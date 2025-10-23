import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  Transport,
  RpcException,
} from '@nestjs/microservices';
import { Res, ValidationPipe } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { envs } from './config';
import { join } from 'path';
import { Registry, collectDefaultMetrics } from 'prom-client';
import { Controller, Get, Module } from '@nestjs/common';
import type { Response } from 'express';

const register = new Registry();
collectDefaultMetrics({ register });

@Controller()
class HealthMetricsController {
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'auth-ms', timestamp: new Date() };
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
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(__dirname, '../../proto/auth.proto'),
        url: `${envs.host}:${envs.port}`,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,

      exceptionFactory: (errors) => {
        const errorMessage = errors
          .map((error) => {
            const constraints = error.constraints
              ? Object.values(error.constraints).join(', ')
              : 'Unknown validation error';

            return `${error.property}: ${constraints}`;
          })
          .join(' | ');

        return new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Validation Failed: ${errorMessage}`,
        });
      },
    }),
  );

  await app.listen();
  console.log(
    `gRPC Auth microservice running on port ${envs.port}`,
  );

  const httpApp = await NestFactory.create(HealthMetricsModule);
  await httpApp.listen(9102, '0.0.0.0');
  console.log(`📊 Metrics + Health HTTP server on port 9102`);
}
bootstrap();
