import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService],
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: { servers: envs.NATS_SERVERS },
      },
    ]),
  ],
})
export class RoutesModule {}
