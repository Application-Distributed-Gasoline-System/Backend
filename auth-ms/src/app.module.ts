import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';
import { NatsModule } from './nats/nats.module';
import { HealthModule } from './health/health.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule,
    UsersModule,
    AuthModule,
    NatsModule,
    HealthModule,
  ],
})
export class AppModule { }