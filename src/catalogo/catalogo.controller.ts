import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service.js';

// @ApiTags('catalogo')
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogService: CatalogoService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Retorna o resumo geral do catálogo' })
  async getSummary() {
    return this.catalogService.getSummary();
  }
}
