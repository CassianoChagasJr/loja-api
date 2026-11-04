import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// Body do POST /categorias -> { "nome": "Canecas" }
export class CreateCategoriaDto {
  @ApiProperty({ example: 'Canecas', minLength: 3 })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nome: string;
}
