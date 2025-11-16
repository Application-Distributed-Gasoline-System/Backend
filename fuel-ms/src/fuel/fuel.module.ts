import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  imports: [NatsModule],
  providers: [FuelService, PrismaService],
  controllers: [FuelController],
})
export class FuelModule { }
