import { Controller, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) { }

  @GrpcMethod('AuthService', 'Register')
  async register(data: RegisterDto) {
    console.log('Register data:', data);
    const roleValue = parseInt(data.role, 10);
    const roleMap: Record<number, UserRole> = {
      0: 'DRIVER',
      1: 'ADMIN',
      2: 'DISPATCHER',
    };

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
      throw new RpcException(error.message);
    }

    return { success: true, message: 'User created' };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: { email: string; password: string }) {
    try {
      const res = await this.authService.login(data.email, data.password);
      return {
        success: true,            
        message: 'Login successful',
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
        driverId: res.driverId || null
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        return {
          success: false,
          message: 'Invalid email or password',
          accessToken: null,
          refreshToken: null,
          expiresIn: 0,
        };
      }
      throw new RpcException(error.message);
    }
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

  @GrpcMethod('AuthService', 'SetUserActiveStatus')
  async setUserActiveStatus(data: { userId: string; active: boolean }) {
    return this.authService.setUserActiveStatus(data.userId, data.active);
  }

  @GrpcMethod('AuthService', 'GetAllUsers')
  async getAllUsers() {
    try {
      const users = await this.authService.getAllUsers();
      return { users };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('AuthService', 'UpdateUser')
  async updateUser(data: {
    userId: string;
    email?: string;
    name?: string;
    role?: string;
  }) {
    try {
      const updated = await this.authService.updateUser(data);
      return { success: true, message: 'User updated', user: updated };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        return { success: false, message: error.message, user: null };
      }
      throw new RpcException(error.message);
    }
  }
}
