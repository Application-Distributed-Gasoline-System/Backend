// src/mailer/mailer.module.ts

import { Module, Global } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host:
            configService.get<string>('SMTP_HOST') || 'smtp-relay.brevo.com',
          port: Number(configService.get<string>('SMTP_PORT') || 587),
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Auth Service" <${configService.get<string>('SENDER_EMAIL')}>`,
        },
        // Configuración de Plantillas
        template: {
          dir: path.join(__dirname, '..', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  // 2. Registrar y exportar el servicio
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
