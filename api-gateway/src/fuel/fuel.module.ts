import { Module } from '@nestjs/common';
import { FuelController } from './fuel.controller';
import { envs, FUEL_PACKAGE } from 'src/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { FuelClientService } from './fuel-client.provider';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FUEL_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'fuel',
          protoPath: join(__dirname, '../../proto/fuel.proto'),
          url: `${envs.fuelMicroserviceHost}:${envs.fuelMicroservicePort}`
        },
      },
    ]), VehiclesModule
  ],
  controllers: [FuelController],
  providers: [FuelClientService]
})
export class FuelModule { }
