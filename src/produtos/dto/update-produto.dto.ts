import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class UpdateProdutoDto {
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
