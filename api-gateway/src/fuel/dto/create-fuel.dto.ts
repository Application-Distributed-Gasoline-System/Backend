import { IsString, IsOptional, IsNumber, IsEnum, IsISO8601 } from 'class-validator';

export enum MachineryType {
  LIGHT = 'LIGHT',
  HEAVY = 'HEAVY',
}

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

  @IsNumber()
  liters: number;

  @IsString()
  fuelType: string;

  @IsEnum(MachineryType)
  machineryType: MachineryType;

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
