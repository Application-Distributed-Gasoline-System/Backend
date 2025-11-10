import { Module } from '@nestjs/common';
import { FuelModule } from './fuel/fuel.module';

@Module({
  imports: [FuelModule],
})
export class AppModule {}
