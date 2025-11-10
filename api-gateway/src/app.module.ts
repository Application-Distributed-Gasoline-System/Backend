import { Module } from '@nestjs/common';

import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { HealthMetricsModule } from './health-metrics/health-metrics.module';
import { RoutesModule } from './routes/routes.module';
import { FuelModule } from './fuel/fuel.module';

@Module({
  imports: [DriversModule, AuthModule, VehiclesModule,HealthMetricsModule, RoutesModule, FuelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
