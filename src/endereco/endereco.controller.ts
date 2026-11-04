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

// Formato do req.user montado pelo JwtStrategy.validate()
type RequisicaoAutenticada = {
  user: { usuarioId: number };
};

// O controller NÃO tem regra de negócio: pega dados da requisição e chama o service.
@ApiTags('enderecos')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description:
    'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
})
@Controller('enderecos')
// Guard na classe: TODAS as rotas exigem token (sem token -> 401).
// Sem ele, req.user seria undefined e a API devolveria 500.
@UseGuards(JwtAuthGuard)
export class EnderecoController {
  constructor(private readonly enderecoService: EnderecoService) {}

  // GET /enderecos
  @Get()
  @ApiOperation({ summary: 'Lista os endereços do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de endereços do usuário' })
  findAllEndereco(@Req() req: RequisicaoAutenticada) {
    return this.enderecoService.findAllForUser(req.user.usuarioId);
  }

  // POST /enderecos  body: { rua, numero, complemento?, bairro, cidade, estado, cep }
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

  // PUT /enderecos/:id
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
    // ParseIntPipe: converte o ":id" para número; "abc" -> 400
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEnderecoDto,
  ) {
    // Ordem dos argumentos igual à assinatura do service: (id, dto, usuarioId)
    return this.enderecoService.updateForUser(id, dto, req.user.usuarioId);
  }

  // DELETE /enderecos/:id
  @Delete(':id')
  @HttpCode(204) // sucesso sem corpo (o service retorna void)
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
