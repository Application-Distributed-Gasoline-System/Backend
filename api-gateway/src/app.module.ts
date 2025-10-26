import { Module } from '@nestjs/common';

import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { HealthMetricsModule } from './health-metrics/health-metrics.module';
import { RoutesModule } from './routes/routes.module';

@Module({
  imports: [DriversModule, AuthModule, VehiclesModule,HealthMetricsModule, RoutesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
