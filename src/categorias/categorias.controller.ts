import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma categoria (Apenas Administradores)' })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.createCategoria(createCategoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna as categorias existentes' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma categoria por id' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findCategoriaById(id);
  }

  @Get(':id/produtos')
  @ApiOperation({ summary: 'Retorna a categoria com os seus produtos' })
  @ApiResponse({
    status: 200,
    description: 'Categoria com a lista de produtos',
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  findProdutos(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findProductsByCategory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma categoria (Apenas Administradores)' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.updateCategoria(id, updateCategoriaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma categoria (Apenas Administradores)' })
  @ApiResponse({ status: 200, description: 'Categoria removida' })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.deleteCategoria(+id);
  }
}
