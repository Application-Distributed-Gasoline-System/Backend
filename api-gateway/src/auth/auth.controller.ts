import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthClientService } from './auth-client.provider'; // Asegúrate que esta ruta sea correcta
import { firstValueFrom } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  RequestResetDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClientService) {}

  // ------------------------------------------
  // 1. REGISTRO
  // POST /auth/register
  // ------------------------------------------
  @Post('register')
  @HttpCode(201) // 201 Created es estándar para el registro exitoso
  async register(@Body() data: RegisterDto) {
    // Nota: El DTO RegisterDto debe mapear los campos (email, password, role, name)
    return firstValueFrom(this.authClient.register(data));
  }

  // ------------------------------------------
  // 2. LOGIN
  // POST /auth/login
  // ------------------------------------------
  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginDto) {
    // Nota: El DTO LoginDto debe mapear los campos (email, password)
    return firstValueFrom(this.authClient.login(data));
  }

  // ------------------------------------------
  // 3. REFRESH TOKEN
  // POST /auth/refresh
  // ------------------------------------------
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body() data: RefreshTokenDto) {
    // Nota: El DTO RefreshTokenDto debe mapear el campo (refreshToken)
    return firstValueFrom(this.authClient.refreshToken(data));
  }

  // ------------------------------------------
  // 4. SOLICITAR RESETEO DE CONTRASEÑA
  // POST /auth/request-reset
  // ------------------------------------------
  @Post('request-reset')
  @HttpCode(200)
  async requestPasswordReset(@Body() data: RequestResetDto) {
    // Nota: El DTO RequestResetDto debe mapear el campo (email)
    // El microservicio enviará el correo
    return firstValueFrom(this.authClient.requestPasswordReset(data));
  }

  // ------------------------------------------
  // 5. COMPLETAR RESETEO DE CONTRASEÑA
  // POST /auth/reset-password
  // ------------------------------------------
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() data: ResetPasswordDto) {
    // Nota: El DTO ResetPasswordDto debe mapear (token, newPassword)
    return firstValueFrom(this.authClient.resetPassword(data));
  }

  // --- 6. CERRAR SESIÓN (Revoke Token) ---
  // POST /auth/logout
  @Post('logout')
  @HttpCode(200)
  async revokeRefreshToken(@Body() data: RefreshTokenDto) {
    // El DTO RefreshTokenDto ya existe y contiene el refreshToken
    return firstValueFrom(this.authClient.revokeToken(data));
  }
}
