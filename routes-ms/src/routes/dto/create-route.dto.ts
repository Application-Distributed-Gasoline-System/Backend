import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum RouteStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MachineryType {
  LIGHT = 'LIGHT',
  HEAVY = 'HEAVY',
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  @Type(() => Number)
  distanceKm: number;

  @IsEnum(MachineryType)
  machineryType: MachineryType;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  estimatedFuelL?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  actualFuelL?: number;

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsNumber()
  @Type(() => Number)
  vehicleId: number;
}
