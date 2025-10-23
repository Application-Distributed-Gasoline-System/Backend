import { Module } from '@nestjs/common';
import { DriversModule } from './drivers/drivers.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [DriversModule, HealthModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}
