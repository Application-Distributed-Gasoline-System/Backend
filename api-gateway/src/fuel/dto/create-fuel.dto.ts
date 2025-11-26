import { IsString, IsOptional, IsNumber, IsEnum, IsISO8601 } from 'class-validator';

export enum FuelSource {
  MANUAL = "manual",
  SENSOR = "sensor",
  ROUTE_COMPLETION = "route-completion",
}

export class CreateFuelDto {
  @IsOptional()
  @IsString()
  externalId?: string;

  @IsString()
  driverId: string;

  @IsString()
  vehicleId: string;

  @IsOptional()
  @IsString()
  routeId?: string;
  
  @IsOptional()
  @IsString()
  routeCode?: string;

  @IsNumber()
  liters: number;

  @IsOptional()
  @IsNumber()
  odometer?: number;

  @IsOptional()
  @IsString()
  gpsLocation?: string;

  @IsOptional()
  @IsEnum(FuelSource)
  source?: FuelSource;

  @IsOptional()
  @IsNumber()
  estimatedFuelL?: number;

  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @IsOptional()
  @IsISO8601()
  recordedAt?: string;
}
