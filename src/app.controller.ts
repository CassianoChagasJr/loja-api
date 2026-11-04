import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';

// Rotas de saúde da API (públicas), sem regra de negócio
@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensagem de boas-vindas' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Verifica se a API está no ar' })
  @ApiResponse({ status: 200, description: '{ status: "ok" }' })
  health() {
    return { status: 'ok' };
  }

  // Cap. 1: nome e versão (constante no AppService)
  @Get('health/version')
  @ApiOperation({ summary: 'Nome e versão da API' })
  @ApiResponse({
    status: 200,
    description: '{ name: "loja-api", version: "0.1.0" }',
  })
  healthVersion() {
    return this.appService.healthVersion();
  }
}
