import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateFuelDto {
  @IsString()
  driverId: string;

  @IsString()
  vehicleId: string;

  @IsOptional()
  @IsString()
  routeId?: string;

  @IsNumber()
  liters: number;

  @IsEnum(['diesel', 'gasolina'], { message: 'fuelType must be diesel or gasolina' })
  fuelType: string;

  @IsEnum(['light', 'heavy'], { message: 'machineryType must be light or heavy' })
  machineryType: string;

  @IsOptional()
  @IsString()
  gpsLocation?: string;

  @IsString()
  userId: string; // viene desde tu Auth (JWT payload)
}
