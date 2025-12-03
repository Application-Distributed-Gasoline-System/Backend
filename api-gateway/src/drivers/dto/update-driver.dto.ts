import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  Length,
  IsDate,
  IsEnum,
} from 'class-validator';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsEnum(['C', 'D', 'E', 'G'], { message: 'La licencia debe ser C, D, E o G' })
  @IsOptional()
  license: 'C' | 'D' | 'E' | 'G';

  @IsString()
  @Length(7, 15, { message: 'El número de teléfono debe tener entre 7 y 15 caracteres' })
  @IsOptional()
  phone: string;

  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date.toISOString() : value;
  })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsOptional()
  birthDate: Date;
}