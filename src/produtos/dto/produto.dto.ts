import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

// Formato de RESPOSTA de produto (usado como "type" no Swagger e no retorno do controller)
export class ProdutoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Caneca Nest' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: 39.9 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  preco: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  estoque: number;
}
