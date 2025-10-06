import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  MicroserviceOptions,
  Transport,
  RpcException,
} from '@nestjs/microservices';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { status } from '@grpc/grpc-js'; // Importar el estado gRPC
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: path.join(__dirname, '..', 'proto', 'auth.proto'),
        url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
      },
    },
  );

  // ----------------------------------------------------
  // Configuración del ValidationPipe para gRPC
  // ----------------------------------------------------
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,

      // La clave para que gRPC maneje los errores de validación
      exceptionFactory: (errors) => {
        // Formatea todos los errores de validación en un único mensaje
        const errorMessage = errors
          .map((error) => {
            const constraints = error.constraints
              ? Object.values(error.constraints).join(', ')
              : 'Unknown validation error';

            return `${error.property}: ${constraints}`;
          })
          .join(' | ');

        // Lanza un RpcException con el código INVALID_ARGUMENT (código 3)
        return new RpcException({
          code: status.INVALID_ARGUMENT,
          message: `Validation Failed: ${errorMessage}`,
        });
      },
    }),
  );
  // ----------------------------------------------------

  await app.listen();
  console.log(
    `gRPC Auth microservice running on port ${process.env.GRPC_PORT || 50051}`,
  );
}
bootstrap();
