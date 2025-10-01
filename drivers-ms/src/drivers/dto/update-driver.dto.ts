import { IsString, IsOptional } from 'class-validator';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  license?: string;
}
