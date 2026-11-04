import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

// Body do PUT /produtos/:id: PUT substitui o produto, então os 3 campos são obrigatórios
export class UpdateProdutoDto {
  @ApiProperty({ example: 'Caneca Nest', minLength: 3 })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: 39.9, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 }) // no máximo 2 casas decimais
  @Min(0.01)
  preco: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsInt()
  @Min(0) // estoque nunca negativo
  estoque: number;
}
