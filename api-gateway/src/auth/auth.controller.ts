import { Controller, Post, Body, HttpCode, Get, Patch } from '@nestjs/common';
import { AuthClientService } from './auth-client.provider'; // Asegúrate que esta ruta sea correcta
import { firstValueFrom } from 'rxjs';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  RequestResetDto,
  ResetPasswordDto,
  UpdateUserDto,
  SetActiveDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClientService) { }

  // ------------------------------------------
  // 1. CRUD: REGISTRO (CREATE)
  // POST /auth/register
  // ------------------------------------------
  @Roles('ADMIN')
  //@Public()
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
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginDto) {
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
  @Public()
  @Post('request-reset')
  @HttpCode(200)
  async requestPasswordReset(@Body() data: RequestResetDto) {
    return firstValueFrom(this.authClient.requestPasswordReset(data));
  }

  // ------------------------------------------
  // 5. COMPLETAR RESETEO DE CONTRASEÑA
  // POST /auth/reset-password
  // ------------------------------------------
  @Public()
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() data: ResetPasswordDto) {
    return firstValueFrom(this.authClient.resetPassword(data));
  }

  // --- 6. CERRAR SESIÓN (Revoke Token) ---
  // POST /auth/logout
  @Post('logout')
  @HttpCode(200)
  async revokeRefreshToken(@Body() data: RefreshTokenDto) {
    return firstValueFrom(this.authClient.revokeToken(data));
  }
  // --- 7.CRUD: DESACTIVAR-ACTIVAR USUARIO (DELETE) ---
  // POST /auth/set-active
  @Post('set-active')
  @Roles('ADMIN')
  @HttpCode(200)
  async setUserActive(@Body() body: SetActiveDto) {
    return firstValueFrom(
      this.authClient.setUserActiveStatus({ userId: body.userId, active: body.active })
    );
  }
  // --- 8.CRUD: TRAER TODOS LOS USUARIOS (READ) ---
  // POST /auth/users
  @Roles('ADMIN')
  @Get('users')
  async getAllUsers() {
    const res = await firstValueFrom(this.authClient.getAllUsers());
    return res.users;
  }

  // --- 9.CRUD: ACTUALIZAR INFORMACION DE USUARIO (UPDATE) ---
  // POST /auth/users
  @Roles('ADMIN')
  @Patch('users')
  async updateUser(@Body() body: UpdateUserDto) {
    const res = await firstValueFrom(this.authClient.updateUser(body));
    return res;
  }

}
