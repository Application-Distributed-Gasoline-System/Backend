import { Module } from '@nestjs/common';
import { RoutesModule } from './routes/routes.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [RoutesModule, NatsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
