import { Module } from '@nestjs/common';
import { FuelService } from './fuel/fuel.service';
import { FuelController } from './fuel/fuel.controller';
import { PrismaService } from './prisma/prisma.service';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [NatsModule],
  providers: [FuelService, PrismaService],
  controllers: [FuelController],
})
export class FuelModule {}
