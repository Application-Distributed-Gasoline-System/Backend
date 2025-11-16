import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { NatsModule } from '../nats/nats.module';

@Module({
  controllers: [RoutesController],
  providers: [RoutesService],
  imports: [NatsModule],
})
export class RoutesModule { }
