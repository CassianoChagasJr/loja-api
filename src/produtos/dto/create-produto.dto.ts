import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({
    description: 'Nome do produto ',
    example: 'Produto A',
    minLength: 3,
  })
  @IsNotEmpty({
    message: 'O nome do produto é obrigatório e não pode ficar vazio ',
  })
  @IsString({ message: 'O nome do produto deve ser um texto válido' })
  @MinLength(3, {
    message: 'O nome do produto deve ter no mínimo 3 caracteres',
  })
  nome: string;

  @ApiProperty({
    description: 'Preço do produto ',
    example: 25.5,
    minimum: 0.01,
    required: true,
  })
  @IsNotEmpty({
    message: 'O preço do produto é obrigatório e não pode ficar vazio ',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'O preço deve ser um número válido com ate duas casas decimais',
    },
  )
  @Min(0.01, { message: 'O preço deve ser de pelo menos R$ 0.01' })
  preco: number;

  @ApiProperty({
    description: 'Estoque do produto ',
    example: 100,
    minimum: 0,
    required: true,
  })
  @IsNotEmpty({
    message: 'O estoque do produto é obrigatório e não pode ficar vazio ',
  })
  @IsInt({ message: 'O estoque deve ser um número inteiro' })
  @Min(0, { message: 'O valor do estoque não pode ser um número negativo' })
  estoque: number;
}
