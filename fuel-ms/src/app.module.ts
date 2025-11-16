import { Module } from '@nestjs/common';
import { FuelModule } from './fuel/fuel.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [FuelModule, NatsModule],
})
export class AppModule {}
