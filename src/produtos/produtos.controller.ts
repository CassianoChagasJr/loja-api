import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ProdutoDto } from './dto/produto.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import ProdutoService from './produto.service.js';
import { JwtAuthGuard } from '../auth/jwt.auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
import { PatchProdutoDto } from './dto/patch-produto.dto.js';
import { ListaProdutosQueryDto } from './dto/lista-produtos-query.dto.js';
import { UpdateProdutoCategoriaDto } from './dto/update-produto-categoria.dto.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  
  @Get()
  @ApiOperation({ summary: 'Retorna todos os produtos cadastrados' })
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
  findAll(@Query() query: ListaProdutosQueryDto): Promise<ProdutoDto[]> {
    return query.q != undefined ||
      query.minPrice != undefined ||
      query.maxPrice != undefined
      ? this.produtoService.findQuery(query)
      : this.produtoService.findAll();
  }

  
  @Get(':id')
  @ApiOperation({summary: 'Retorna um produto cadastrado por um id'})
  findById(@Param('id') id: number): Promise<ProdutoDto> {
    return this.produtoService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
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
  @ApiOperation({
    summary:
      'Atualiza todos os campos de um produto. Apenas administradores ou gerentes tem permissão',
  })
  update(
    @Param('id') id: number,
    @Body() updatedProduct: UpdateProdutoDto,
  ): Promise<ProdutoDto> {
    return this.produtoService.update(id, updatedProduct);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
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
  @ApiOperation({
    summary:
      'Atualiza parcialmente um produto. Apenas administradores ou gerentes tem permissão',
  })
  partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchProdutoDto: PatchProdutoDto,
  ): Promise<ProdutoDto> {
    return this.produtoService.update(id, patchProdutoDto);
  }

  @Patch(':id/categoria')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
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
  async updateCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoCategoriaDto,
  ) {
    return await this.produtoService.updateCategoria(id, dto.idCategoria);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
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
  delete(@Param('id') id: number): Promise<void> {
    return this.produtoService.delete(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criação de um novo produto (Apenas Administradores)',
  })
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
  })
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
  create(@Body() createProdutos: CreateProdutoDto): Promise<ProdutoDto> {
    return this.produtoService.create(createProdutos);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiResponse({
    status: 201,
    description: 'Produto cadastrado com sucesso',
    type: ProdutoDto,
  })
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const safe = file.originalname.replace(/\s+/g, '_');
          callback(null, `${Date.now()} - ${safe}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(
          file.mimetype,
        );
        if (!ok) {
          return callback(null, false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(`Envie o campo file (jpeg/png/web)`);
    }
    await this.produtoService.updateImageFileName(id, file.filename);
    return { produtoId: id, imageUrl: `/produtos/${id}/image` };
  }

  @Get(':id/image')
  async getImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const produto = await this.produtoService.findById(id);
    if (!produto || !produto.imageFileName) {
      throw new NotFoundException(`Imagem não encontrada`);
    }
    const caminho = join(process.cwd(), 'uploads', produto.imageFileName);
    if (!existsSync(caminho)) {
      throw new NotFoundException(`Imagem não encontrada`);
    }
    createReadStream(caminho).pipe(res);
  }
}
