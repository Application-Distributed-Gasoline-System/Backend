import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { UserRole } from '../../../generated/prisma';
import { Type } from 'class-transformer';
const validRoles = ['0', '1', '2'];

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString() // 1. Asegura que es una cadena
  @IsIn(validRoles) // 2. Valida contra las cadenas '0', '1', '2'
  role: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
