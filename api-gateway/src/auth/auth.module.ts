import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthClientService } from './auth-client.provider';
import { join } from 'path';
import { AUTH_PACKAGE, envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, '../../proto/auth.proto'),
          url: `${envs.authMicroserviceHost}:${envs.authMicroservicePort}`,
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthClientService],
})
export class AuthModule {}
