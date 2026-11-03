import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service.js';


@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogService: CatalogoService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Retorna o resumo geral do catálogo com todos os produtos cadastrados e todas as unidades no estoque' })
  async getSummary() {
    return this.catalogService.getSummary();
  }
}
