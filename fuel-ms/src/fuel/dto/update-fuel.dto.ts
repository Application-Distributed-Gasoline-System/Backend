import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateFuelDto {

  @IsOptional()
  @IsNumber()
  liters?: number;

  @IsOptional()
  @IsEnum(['diesel', 'gasolina'], { message: 'fuelType must be diesel or gasolina' })
  fuelType?: string;

  @IsOptional()
  @IsEnum(['light', 'heavy'], { message: 'machineryType must be light or heavy' })
  machineryType?: string;

  @IsOptional()
  @IsString()
  gpsLocation?: string;

  @IsOptional()
  @IsString()
  routeId?: string;

  // Este SIEMPRE debe venir del token
  @IsOptional()
  @IsString()
  userId: string;
}
