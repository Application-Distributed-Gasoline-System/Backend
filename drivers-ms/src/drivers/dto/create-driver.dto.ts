import {
  IsString,
  IsNotEmpty,
} from 'class-validator';
export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string; // Desde Auth Service


  @IsString()
  @IsNotEmpty({ message: 'El ID de usuario es obligatorio' })
  userId: string; // Desde Auth Service

}
