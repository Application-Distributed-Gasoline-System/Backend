import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { MachineryType, RouteStatus } from './create-route.dto';
import { Type } from 'class-transformer';

export class UpdateRouteDto {
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

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsNotEmpty()
  driverId: string;

  @IsNumber()
  @Type(() => Number)
  vehicleId: number;
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  actualFuelL?: number;

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
