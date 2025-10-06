import { Module } from '@nestjs/common';

import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [DriversModule, AuthModule, VehiclesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
