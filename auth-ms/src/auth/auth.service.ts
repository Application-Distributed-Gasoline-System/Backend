import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../generated/prisma';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { PrismaService } from '../prisma/prisma.Service';
import * as bcrypt from 'bcryptjs';
import { isBefore, addHours  } from 'date-fns';
import { MailerService } from '../mailer/mailer.service';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  private jwtSecret = process.env.JWT_SECRET || 'supersecret';
  private jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN) || 900;
  private refreshExpiresDays =
    Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
  private resetTokenExpiresHours =
    Number(process.env.RESET_TOKEN_EXPIRES_HOURS) || 24;

  async register(
    email: string,
    password: string,
    role: UserRole,
    name?: string,
  ) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const user = await this.usersService.create(email, password, role, name);
    return { success: true, message: 'User created', userId: user.id };
  }

  signPayload(payload: object) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return { valid: true, decoded };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.usersService.validatePassword(
      password,
      user.password,
    );
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // 1. Crear el PAYLOAD JWT con role
    const accessToken = this.signPayload({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenStr = uuidv4() + '.' + uuidv4();

    // 2. Guardar Refresh Token usando PRISMA
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      expiresIn: this.jwtExpiresIn,
    };
  }

  async refreshToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revoked) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const newRefreshTokenStr = uuidv4() + '.' + uuidv4();
    await this.prisma.refreshToken.create({
      data: {
        token: newRefreshTokenStr,
        userId: user.id,
      },
    });

    const accessToken = this.signPayload({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenStr,
      expiresIn: this.jwtExpiresIn,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored) return false;

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return true;
  }

  async validateAccessToken(token: string) {
    const res = this.verifyToken(token);
    if (!res.valid) return { valid: false };

    const { sub, email, role } = res.decoded as any;

    const user = await this.usersService.findById(sub);
    if (!user) return { valid: false };

    return {
      valid: true,
      user: {
        id: sub,
        email: email,
        role: role,
      },
    };
  }

  // --- 📨 Solicitar reset password ---
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message: 'If the user exists, a password reset link has been sent.',
        resetToken: null,
      };
    }

    // 1. GENERAR TOKEN y FECHA DE EXPIRACIÓN
    const resetToken = uuidv4() + '-' + uuidv4();
    const expiresAt = addHours(new Date(), this.resetTokenExpiresHours); // Añadir horas/días

    // 2. GUARDAR EN PRISMA
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // 3. ENVÍO DEL CORREO
    try {
      await this.mailerService.sendPasswordResetLink(user.email, resetToken);
    } catch (error) {
      console.error('Error sending reset email:', error);
      // Decide si fallar aquí o responder éxito (depende de la política de seguridad)
      // Por ahora, solo logeamos el error y respondemos éxito para no revelar si el correo falló.
    }

    // 4. RESPUESTA (Solo devolvemos el token para pruebas, sino es null)
    const message = 'Password reset link sent to email.';

    return {
      success: true,
      message: message,
      // Solo devolver en desarrollo
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : null,
    };
  }

  // --- 🔒 Cambiar la contraseña ---
  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return { success: false, message: 'Invalid or expired token' };
    }

    if (isBefore(record.expiresAt, new Date())) {
      await this.prisma.passwordResetToken.delete({ where: { id: record.id } });
      return { success: false, message: 'Token expired' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    await this.prisma.passwordResetToken.delete({
      where: { id: record.id },
    });

    return { success: true, message: 'Password reset successfully' };
  }
}
