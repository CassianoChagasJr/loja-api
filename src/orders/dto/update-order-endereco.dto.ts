import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

// Body do PATCH /orders/:id/endereco -> { "enderecoId": 1 }
export class UpdateOrderEnderecoDto {
  @ApiProperty({ example: 1 })
  // "abc", 1.5, vazio ou 0 -> 400 automático
  @IsInt()
  @Min(1)
  enderecoId: number;
}
