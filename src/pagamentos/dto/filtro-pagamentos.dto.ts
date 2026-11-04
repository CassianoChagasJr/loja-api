import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { STATUS_PAGAMENTO } from '../pagamento.entity.js';
import type { StatusPagamento } from '../pagamento.entity.js';

// Query string do GET /pagamentos?status=PAGO&pedidoId=3 (os dois são opcionais)
export class FiltroPagamentosDto {
  @ApiPropertyOptional({ enum: STATUS_PAGAMENTO })
  @IsOptional()
  @IsIn(STATUS_PAGAMENTO, {
    message: 'status deve ser PENDENTE, PAGO ou CANCELADO',
  })
  status?: StatusPagamento;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  // Tudo na URL chega como texto; @Type converte para número antes de validar
  @Type(() => Number)
  @IsInt({ message: 'pedidoId deve ser um número inteiro' })
  @Min(1)
  pedidoId?: number;
}
