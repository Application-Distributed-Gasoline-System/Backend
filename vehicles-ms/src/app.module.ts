import { Module } from '@nestjs/common';
import { VehiclesModule } from './vehicles/vehicles.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [VehiclesModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
