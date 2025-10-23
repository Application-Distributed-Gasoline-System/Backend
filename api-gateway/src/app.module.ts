import { Module } from '@nestjs/common';

import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { HealthMetricsModule } from './health-metrics/health-metrics.module';

@Module({
  imports: [DriversModule, AuthModule, VehiclesModule,HealthMetricsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
