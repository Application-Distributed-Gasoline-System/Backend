import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { MachineryType, RouteStatus } from './create-route.dto';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
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
