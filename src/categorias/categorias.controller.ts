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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cria o nome de uma categoria' })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.createCategoria(createCategoriaDto);
  }

  @Get()
  @ApiOperation({summary: 'Retorna as categorias existentes'})
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Retorna uma categoria por id'})
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findCategoriaById(id);
  }

  @Get(':id/produtos')
  findProdutos(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findProductsByCategory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.updateCategoria(id, updateCategoriaDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Você não tem permissão para acessar esse recurso',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.deleteCategoria(+id);
  }
}
