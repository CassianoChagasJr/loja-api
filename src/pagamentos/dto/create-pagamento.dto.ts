import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { METODOS_PAGAMENTO } from '../pagamento.entity.js';
import type { MetodoPagamento } from '../pagamento.entity.js';

// Body do POST /orders/:id/pagamentos -> { "metodo": "PIX" }
// pedidoId vem da URL e userId vem do token: nenhum dos dois é aceito no body
export class CreatePagamentoDto {
  @ApiProperty({ enum: METODOS_PAGAMENTO, example: 'PIX' })
  // Qualquer valor fora da lista -> 400 automático (ValidationPipe)
  @IsIn(METODOS_PAGAMENTO, {
    message: 'metodo deve ser CARTAO, BOLETO ou PIX',
  })
  metodo: MetodoPagamento;
}
