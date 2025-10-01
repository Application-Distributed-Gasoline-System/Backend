// import { PartialType } from '@nestjs/mapped-types';
// import { CreateDriverDto } from './create-driver.dto';

// export class UpdateDriverDto extends PartialType(CreateDriverDto) {}

import { IsString, IsOptional } from 'class-validator';

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  license: string;
}

