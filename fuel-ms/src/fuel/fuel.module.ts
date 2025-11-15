import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FuelEventsListener } from './fuel.nats.listener';

@Module({
  imports: [],
  providers: [FuelService, PrismaService, FuelEventsListener],
  controllers: [FuelController],
})
export class FuelModule { }
