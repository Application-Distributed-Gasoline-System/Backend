import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ROUTES_PACKAGE } from 'src/config';
import { join } from 'path';
import { RoutesClientService } from './route-client.provider';

@Module({
  controllers: [RoutesController],
  providers: [RoutesClientService],
  imports: [
      ClientsModule.register([
        { name: ROUTES_PACKAGE,
          transport: Transport.GRPC,
            options: {
              package: 'routes',
              protoPath: join(__dirname, '../../proto/routes.proto'), 
              url: `${envs.routesMicroserviceHost}:${envs.routesMicroservicePort}`
            },
         },
      ]),
    ],
})
export class RoutesModule {}
