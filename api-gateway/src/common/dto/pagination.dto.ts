import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, Max } from 'class-validator';

export class PaginationDto {
  @IsPositive()
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsPositive()
  @IsInt()
  @Max(1000)
  @IsOptional()
  @Type(() => Number)
  limit: number = 10;
}
