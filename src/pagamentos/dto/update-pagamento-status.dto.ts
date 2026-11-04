import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { StatusPagamento } from '../pagamento.entity.js';

// Body do PATCH /pagamentos/:id/status -> { "status": "PAGO" }
// Só existe "status": se o cliente mandar "metodo", o forbidNonWhitelisted
// devolve 400. É assim que garantimos que o método não muda depois de criado.
export class UpdatePagamentoStatusDto {
  @ApiProperty({ enum: ['PAGO', 'CANCELADO'], example: 'PAGO' })
  // PENDENTE não entra: não dá para "voltar" um pagamento para pendente
  @IsIn(['PAGO', 'CANCELADO'], { message: 'status deve ser PAGO ou CANCELADO' })
  status: Exclude<StatusPagamento, 'PENDENTE'>;
}
