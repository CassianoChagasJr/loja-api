import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { PagamentosService } from './pagamentos.service.js';
import { CreatePagamentoDto } from './dto/create-pagamento.dto.js';
import { UpdatePagamentoStatusDto } from './dto/update-pagamento-status.dto.js';
import { FiltroPagamentosDto } from './dto/filtro-pagamentos.dto.js';

// Formato do req.user montado pelo JwtStrategy.validate()
type RequisicaoAutenticada = {
  user: { usuarioId: number; perfil: string };
};

// O controller NÃO tem regra de negócio: pega dados da requisição e chama o service.
@ApiTags('pagamentos')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description:
    'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
})
// Prefixo vazio: cada rota tem o caminho completo (/orders/... e /pagamentos/...)
@Controller()
// Guard na classe: TODAS as rotas exigem token (sem token -> 401)
@UseGuards(JwtAuthGuard)
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  // POST /orders/:id/pagamentos  body: { "metodo": "PIX" }
  @Post('orders/:id/pagamentos')
  @ApiOperation({
    summary: 'Cria pagamento (fake) para um pedido ABERTO do usuário',
  })
  @ApiResponse({ status: 201, description: 'Pagamento criado como PENDENTE' })
  @ApiResponse({
    status: 400,
    description:
      'Método inválido, pedido não ABERTO ou já existe pagamento ativo',
  })
  @ApiResponse({
    status: 403,
    description: 'ADMIN/MANAGER tentando pagar pedido de outro usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado (ou de outro cliente)',
  })
  create(
    @Req() req: RequisicaoAutenticada,
    // ":id" da URL é o id do PEDIDO; ParseIntPipe converte e dá 400 se não for número
    @Param('id', ParseIntPipe) pedidoId: number,
    @Body() dto: CreatePagamentoDto,
  ) {
    return this.pagamentosService.createForActor(
      pedidoId,
      dto,
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  // GET /pagamentos?status=PAGO&pedidoId=1
  @Get('pagamentos')
  @ApiOperation({
    summary:
      'Lista pagamentos: cliente vê os seus, ADMIN vê todos. Filtros status e pedidoId',
  })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos' })
  @ApiResponse({ status: 400, description: 'Filtro inválido' })
  findAll(
    @Req() req: RequisicaoAutenticada,
    // @Query lê a query string e valida com o FiltroPagamentosDto
    @Query() filtro: FiltroPagamentosDto,
  ) {
    return this.pagamentosService.findAllForActor(
      filtro,
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  // PATCH /pagamentos/:id/status  body: { "status": "PAGO" | "CANCELADO" }
  @Patch('pagamentos/:id/status')
  @ApiOperation({
    summary:
      'Marca pagamento como PAGO (pedido vira PAGO) ou CANCELADO. Dono ou ADMIN',
  })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({
    status: 400,
    description: 'Status inválido, pagamento não PENDENTE ou pedido não ABERTO',
  })
  @ApiResponse({
    status: 404,
    description: 'Pagamento não encontrado (ou de outro cliente)',
  })
  updateStatus(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePagamentoStatusDto,
  ) {
    return this.pagamentosService.updateStatusForActor(
      id,
      dto.status,
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  // DELETE /pagamentos/:id  -> só ADMIN
  @Delete('pagamentos/:id')
  // RolesGuard roda DEPOIS do JwtAuthGuard da classe: primeiro "quem é", depois "pode?"
  @UseGuards(RolesGuard)
  @Roles('ADMIN') // não-ADMIN -> 403
  @HttpCode(204) // sucesso sem corpo
  @ApiOperation({ summary: 'Remove um pagamento (Apenas Administradores)' })
  @ApiResponse({ status: 204, description: 'Pagamento removido' })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagamentosService.remove(id);
  }
}
