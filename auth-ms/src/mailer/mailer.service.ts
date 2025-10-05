// src/mailer/mailer.service.ts

import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Renombramos NestMailerService para evitar conflictos con el nombre de esta clase
@Injectable()
export class MailerService {
  constructor(
    private readonly nestMailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetLink(email: string, resetToken: string) {
    // Obtener la URL del frontend de la configuración (debes añadir FRONTEND_URL a tu .env)
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    await this.nestMailerService.sendMail({
      to: email,
      subject: 'Restablecer tu Contraseña (Servicio gRPC Auth)',
      
      // Usar la plantilla configurada en AppModule
      template: 'password-reset', 
      context: { 
          email: email,
          resetUrl: resetUrl,
      },
    });
  }
}