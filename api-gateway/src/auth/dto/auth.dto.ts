import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
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

  @IsString()
  @IsIn(validRoles)
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

export class RequestResetDto {
  @IsEmail()
  email: string;
}
export class ResetPasswordDto {
  @IsString()
  // El token es el que se extrae del parámetro de consulta de la URL del correo.
  token: string;

  @IsString()
  @MinLength(8)
  // La nueva contraseña que el usuario quiere usar.
  newPassword: string;
}
