import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DriversController } from './drivers.controller';
import { DriversClientService } from './driver-client.provider';
import { join } from 'path';
import { DRIVERS_PACKAGE, envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      { name: DRIVERS_PACKAGE,
        transport: Transport.GRPC,
          options: {
            package: 'drivers',
            protoPath: join(__dirname, '../../proto/drivers.proto'), 
            url: `${envs.driversMicroserviceHost}:${envs.driversMicroservicePort}`
          },
       },
    ]),
  ],
  controllers: [DriversController],
  providers: [DriversClientService],
})
export class DriversModule {}

