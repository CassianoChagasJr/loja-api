import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { CreateProdutoDto } from './create-produto.dto.js';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsString()
  @MinLength(3)
  nome: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  preco: number;

  @IsInt()
  @Min(0)
  estoque: number;
}
