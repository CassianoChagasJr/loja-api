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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';
import { EnderecoService } from './endereco.service.js';

type RequisicaoAutenticada = {
  user: { usuarioId: number };
};

@ApiTags('enderecos')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description:
    'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
})
@Controller('enderecos')
@UseGuards(JwtAuthGuard)
export class EnderecoController {
  constructor(private readonly enderecoService: EnderecoService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os endereços do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de endereços do usuário' })
  findAllEndereco(@Req() req: RequisicaoAutenticada) {
    return this.enderecoService.findAllForUser(req.user.usuarioId);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra um endereço para o usuário logado' })
  @ApiResponse({ status: 201, description: 'Endereço criado' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou campo extra (ex.: userId)',
  })
  createEndereco(
    @Req() req: RequisicaoAutenticada,
    @Body() dto: CreateEnderecoDto,
  ) {
    return this.enderecoService.createForUser(dto, req.user.usuarioId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Substitui um endereço do usuário logado' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou id não numérico',
  })
  @ApiResponse({
    status: 404,
    description: 'Endereço não encontrado entre os seus endereços',
  })
  updateEndereco(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEnderecoDto,
  ) {
    return this.enderecoService.updateForUser(id, dto, req.user.usuarioId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um endereço do usuário logado' })
  @ApiResponse({
    status: 204,
    description:
      'Endereço removido (pedidos ligados ficam com enderecoId null)',
  })
  @ApiResponse({ status: 400, description: 'Id não numérico' })
  @ApiResponse({
    status: 404,
    description: 'Endereço não encontrado entre os seus endereços',
  })
  deleteEndereco(
    @Req() req: RequisicaoAutenticada,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.enderecoService.removeForUser(id, req.user.usuarioId);
  }
}
