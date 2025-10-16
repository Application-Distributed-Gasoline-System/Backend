import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  imports: [UsersModule, PrismaModule, NatsModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
