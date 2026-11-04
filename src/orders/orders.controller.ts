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

type RequisicaoAutenticada = {
  user: { usuarioId: number; perfil: string };
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: RequisicaoAutenticada, @Body() dto: CreateOrderDto) {
    return this.orderService.create(dto, req.user.usuarioId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: RequisicaoAutenticada) {
    return this.orderService.findAllForActor(req.user.usuarioId, req.user.perfil);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.findOneForActor(id, req.user.usuarioId, req.user.perfil);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  cancel(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancelForActor(id, req.user.usuarioId, req.user.perfil);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ){
    return this.orderService.updateStatusForActor(
      id,
      req.user.usuarioId,
      req.user.perfil,
      dto.status,
    )
  }
}
