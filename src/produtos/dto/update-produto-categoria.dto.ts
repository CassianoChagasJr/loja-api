import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateProdutoCategoriaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'O ID da categoria é obrigatório.' })
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  idCategoria: number;
}
