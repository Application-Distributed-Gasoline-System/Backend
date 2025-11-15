import { IsOptional, IsISO8601, IsArray, IsString } from 'class-validator';

export class ReportRequestDto {
  @IsISO8601()
  from: string;

  @IsISO8601()
  to: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicleIds?: string[];

  @IsOptional()
  @IsString()
  machineryType?: 'LIGHT' | 'HEAVY';
}
