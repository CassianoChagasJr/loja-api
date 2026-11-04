import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ListaProdutosQueryDto {
  @ApiPropertyOptional({ description: 'Trecho do nome', example: 'caneca' })
  @IsOptional()
  @IsString({ message: 'O termo de busca deve ser um texto valido' })
  q?: string;

  @ApiPropertyOptional({ example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'O preço mínimo deve ser um número' })
  @Min(0, { message: 'O preço mínimo não pode ser negativo' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'o preço máximo deve ser um número' })
  @Min(0, { message: 'O preço máximo não pode ser negativo' })
  maxPrice?: number;
}
