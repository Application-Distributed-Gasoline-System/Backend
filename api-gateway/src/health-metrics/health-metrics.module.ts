import { Module } from '@nestjs/common';
import { HealthMetricsController } from './health-metrics.controller';

@Module({
  controllers: [HealthMetricsController],
})
export class HealthMetricsModule {}
