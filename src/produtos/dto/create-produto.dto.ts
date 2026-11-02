import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({
    description: 'Nome do produto ',
    example: 'Produto A',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({
    description: 'Preço do produto ',
    example: 25.50,
    minimum: 0.01,
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  preco: number;

  @ApiProperty({
    description: 'Estoque do produto ',
    example: 100,
    minimum: 0,
    required: true,
  })
  @IsInt()
  @Min(0)
  estoque: number;
}
