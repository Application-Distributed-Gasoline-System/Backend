import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  plate: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  engineDisplacement: number;

  @IsEnum(['GASOLINE','DIESEL','ELECTRIC','HYBRID'])
  engineType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

  @IsEnum(['LIGHT','HEAVY'])
  machineryType: 'LIGHT' | 'HEAVY';

  @IsNumber()
  tankCapacity: number;

  @IsNumber()
  averageConsumption: number;

  @IsNumber()
  @IsOptional()
  mileage?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
