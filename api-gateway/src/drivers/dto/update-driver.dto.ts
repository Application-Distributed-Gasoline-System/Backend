import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  Length,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsEnum(['C', 'D', 'E', 'G'], { message: 'La licencia debe ser C, D, E o G' })
  @IsOptional()
  license: 'C' | 'D' | 'E' | 'G';

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  userId: string;

  @IsString()
  @Length(7, 15, { message: 'El número de teléfono debe tener entre 7 y 15 caracteres' })
  @IsOptional()
  phone: string;

  @IsBoolean({ message: 'isAvailable debe ser un valor booleano (true o false)' })
  @IsOptional()
  isAvailable?: boolean;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsOptional()
  birthDate: Date;
}
