import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

// Body do PATCH /produtos/:id/categoria -> { "idCategoria": 1 }
// Se a categoria existe é checado no service (404)
export class UpdateProdutoCategoriaDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'O ID da categoria é obrigatório.' })
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  idCategoria: number;
}
