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
    // 1. Configuración de la conexión SMTP y plantillas (todo centralizado aquí)
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp-relay.sendinblue.com',
          port: 587,
          secure: false,
          // 🚨 SOLUCIÓN INSEGURA: DESHABILITAR LA VERIFICACIÓN 🚨
          tls: {
            rejectUnauthorized: false,
          },
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
          // Usa path.join para resolver la ruta a src/templates desde el directorio de este archivo
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
