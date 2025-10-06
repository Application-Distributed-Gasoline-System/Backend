import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { VehiclesController } from './vehicles.controller';
import { VehiclesClientService } from './vehicles-client-provider';
import { join } from 'path';
import { envs, VEHICLES_PACKAGE } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      { name: VEHICLES_PACKAGE,
        transport: Transport.GRPC,
          options: {
            package: 'vehicles',
            protoPath: join(__dirname, '../../proto/vehicles.proto'), 
            url: `${envs.vehiclesMicroserviceHost}:${envs.vehiclesMicroservicePort}`,
          },
       },
    ]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesClientService],
})
export class VehiclesModule {}

