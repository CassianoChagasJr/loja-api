import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { UpdateOrderStatusDto } from './dto/update-orders-status.dto.js';
import { UpdateOrderEnderecoDto } from './dto/update-order-endereco.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

type RequisicaoAutenticada = {
  user: { usuarioId: number; perfil: string };
};

@ApiTags('pedidos')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description:
    'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
})
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria um pedido ABERTO para o usuário logado' })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado (estoque descontado)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou estoque insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  create(@Req() req: RequisicaoAutenticada, @Body() dto: CreateOrderDto) {
    return this.orderService.create(dto, req.user.usuarioId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lista pedidos: CLIENTE vê os seus; ADMIN e MANAGER veem todos',
  })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  findAll(@Req() req: RequisicaoAutenticada) {
    return this.orderService.findAllForActor(
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna um pedido (CLIENTE só os seus)' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado (ou de outro usuário)',
  })
  findOne(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOneForActor(
      id,
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancela um pedido ABERTO e devolve o estoque' })
  @ApiResponse({ status: 200, description: 'Pedido CANCELADO' })
  @ApiResponse({ status: 400, description: 'Pedido não está ABERTO' })
  @ApiResponse({
    status: 403,
    description: 'MANAGER não pode cancelar pedido de outro usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado (ou de outro usuário)',
  })
  cancel(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancelForActor(
      id,
      req.user.usuarioId,
      req.user.perfil,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Muda o status: ABERTO → PAGO ou CANCELADO' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({
    status: 400,
    description:
      'Status inválido, pedido PAGO não cancela ou pedido não está ABERTO',
  })
  @ApiResponse({
    status: 403,
    description: 'MANAGER não pode alterar pedido de outro usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado (ou de outro usuário)',
  })
  updateStatus(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatusForActor(
      id,
      req.user.usuarioId,
      req.user.perfil,
      dto.status,
    );
  }

  @Patch(':id/endereco')
  @UseGuards(JwtAuthGuard)
  @ApiTags('enderecos')
  @ApiOperation({ summary: 'Liga um endereço do usuário a um pedido dele' })
  @ApiResponse({ status: 200, description: 'Pedido com enderecoId atualizado' })
  @ApiResponse({
    status: 400,
    description: 'enderecoId inválido ou pedido não está ABERTO',
  })
  @ApiResponse({
    status: 403,
    description: 'ADMIN/MANAGER não é dono do pedido',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido ou endereço não encontrado (ou de outro usuário)',
  })
  updateEndereco(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderEnderecoDto,
  ) {
    return this.orderService.definirEnderecoForActor(
      id,
      dto.enderecoId,
      req.user.usuarioId,
      req.user.perfil,
    );
  }
}
