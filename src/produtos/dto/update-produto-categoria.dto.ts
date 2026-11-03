import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateProdutoCategoriaDto {
  @IsNotEmpty({ message: 'O ID da categoria é obrigatório.' })
  @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
  idCategoria: number;
}
