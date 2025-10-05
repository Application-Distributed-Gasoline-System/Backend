// src/app.module.ts

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; 
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    // Configuración global (necesaria para toda la app)
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // Módulos funcionales
    MailerModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}