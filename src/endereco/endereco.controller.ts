import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';
import { EnderecoService } from './endereco.service.js';

type RequisicaoAutenticada = {
  user: { usuarioId: number };
};

@Controller('enderecos')
@UseGuards(JwtAuthGuard)
export class EnderecoController {
  constructor(private readonly enderecoService: EnderecoService) {}

  @Get()
  findAllEndereco(@Req() req: RequisicaoAutenticada) {
    return this.enderecoService.findAllForUser(req.user.usuarioId);
  }
  @Post()
  createEndereco(
    @Req() req: RequisicaoAutenticada,
    @Body() dto: CreateEnderecoDto,
  ) {
    return this.enderecoService.createForUser(dto, req.user.usuarioId);
  }

  @Put(':id')
  updateEndereco(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEnderecoDto,
  ) {
    return this.enderecoService.updateForUser(id, dto, req.user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteEndereco(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enderecoService.removeForUser(id, req.user.usuarioId);
  }
}
