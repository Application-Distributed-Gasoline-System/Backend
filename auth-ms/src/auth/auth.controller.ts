import { Controller, BadRequestException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AuthService } from './auth.service';
import { UserRole } from '../../generated/prisma';
import { RegisterDto } from './dto/auth.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterDto) {
    console.log('Register data:', data); // DEBE imprimir el rol aquí
    const roleValue = parseInt(data.role, 10);
    // Map numérico -> UserRole string (Prisma)
    const roleMap: Record<number, UserRole> = {
      0: 'DRIVER',
      1: 'ADMIN',
      2: 'DISPATCHER',
    };

    // Si el ValidationPipe pasa, 'data.role' es un número válido.
    const roleEnum = roleMap[roleValue];

    try {
      await this.authService.register(
        data.email,
        data.password,
        roleEnum,
        data.name,
      );
    } catch (error) {
      console.error('Error en register:', error);
      // Asegúrate de que tu error service sea un RpcException o un string simple
      throw new RpcException(error.message);
    }

    return { success: true, message: 'User created' };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: any) {
    const { email, password } = data;
    const res = await this.authService.login(email, password);
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresIn: res.expiresIn,
    };
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: any) {
    const { refreshToken } = data;
    const res = await this.authService.refreshToken(refreshToken);
    return {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      expiresIn: res.expiresIn,
    };
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: any) {
    const { token } = data;
    const r = await this.authService.validateAccessToken(token);

    if (!r.valid || !r.user) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: r.user.id,
      email: r.user.email,
      role: r.user.role,
    };
  }

  @GrpcMethod('AuthService', 'RevokeToken')
  async revokeToken(data: any) {
    const { refreshToken } = data;
    const ok = await this.authService.revokeRefreshToken(refreshToken);
    return { revoked: ok };
  }

  // --- Solicitar Reset Password ---
  @GrpcMethod('AuthService', 'RequestPasswordReset')
  async requestPasswordReset(data: any) {
    const { email } = data;
    const result = await this.authService.requestPasswordReset(email);
    return {
      success: result.success,
      message: result.message,
      //resetToken: result.resetToken, // solo visible en desarrollo
    };
  }

  // --- Cambiar Password ---
  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data: any) {
    const { token, newPassword } = data;
    const result = await this.authService.resetPassword(token, newPassword);
    return {
      success: result.success,
      message: result.message,
    };
  }
}
