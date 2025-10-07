import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  Length,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string; // Desde Auth Service

  @IsString()
  @IsEnum(['C', 'D', 'E', 'G'], { message: 'La licencia debe ser C, D, E o G' })
  license: 'C' | 'D' | 'E' | 'G';

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  userId: string; // Desde Auth Service

  @IsString()
  @Length(7, 15, { message: 'El número de teléfono debe tener entre 7 y 15 caracteres' })
  phone: string;

  @IsBoolean({ message: 'isAvailable debe ser un valor booleano (true o false)' })
  @IsOptional()
  isAvailable: boolean = true;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  birthDate: Date;
}
