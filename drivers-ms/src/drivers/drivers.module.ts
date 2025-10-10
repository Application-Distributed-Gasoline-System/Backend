import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'src/config';

@Module({
  controllers: [DriversController],
  providers: [DriversService],
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
export class DriversModule {}
