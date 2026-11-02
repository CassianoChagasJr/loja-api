import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nome: string;
}
