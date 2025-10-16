import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  Transport,
  RpcException,
} from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { envs } from './config';
import { join } from 'path';

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
    `gRPC Auth microservice running on port ${process.env.GRPC_PORT}`,
  );
}
bootstrap();
