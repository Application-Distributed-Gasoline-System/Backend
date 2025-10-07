import { CreateDriverDto } from './create-driver.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}
