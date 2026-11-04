import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service.js';

@ApiTags('catalogo')
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogService: CatalogoService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Retorna o resumo geral do catálogo com todos os produtos cadastrados e todas as unidades no estoque',
  })
  @ApiResponse({
    status: 200,
    description: '{ produtosTotaisCadastrados, unidadesTotaisEmEstoque }',
  })
  async getSummary() {
    return this.catalogService.getSummary();
  }
}
