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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
import { PatchProdutoDto } from './dto/patch-produto.dto.js';
import { ListaProdutosQueryDto } from './dto/lista-produtos-query.dto.js';
import { UpdateProdutoCategoriaDto } from './dto/update-produto-categoria.dto.js';

@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista os produtos (filtros opcionais: q, minPrice, maxPrice)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos',
    type: ProdutoDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Filtro inválido' })
  findAll(@Query() query: ListaProdutosQueryDto): Promise<ProdutoDto[]> {
    return query.q != undefined ||
      query.minPrice != undefined ||
      query.maxPrice != undefined
      ? this.produtoService.findQuery(query)
      : this.produtoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um produto cadastrado por um id' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado',
    type: ProdutoDto,
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<ProdutoDto> {
    return this.produtoService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Atualiza todos os campos de um produto. Apenas administradores ou gerentes tem permissão',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado',
    type: ProdutoDto,
  })
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
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedProduct: UpdateProdutoDto,
  ): Promise<ProdutoDto> {
    return this.produtoService.update(id, updatedProduct);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Atualiza parcialmente um produto. Apenas administradores ou gerentes tem permissão',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado',
    type: ProdutoDto,
  })
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
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() patchProdutoDto: PatchProdutoDto,
  ): Promise<ProdutoDto> {
    return this.produtoService.update(id, patchProdutoDto);
  }

  @Patch(':id/categoria')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Associa o produto a uma categoria (Apenas Administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto com a categoria atualizada',
  })
  @ApiResponse({ status: 400, description: 'idCategoria inválido' })
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
  @ApiResponse({
    status: 404,
    description: 'Produto ou categoria não encontrado',
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove um produto (Apenas Administradores)' })
  @ApiResponse({ status: 204, description: 'Produto removido' })
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
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
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
  create(@Body() createProdutos: CreateProdutoDto): Promise<ProdutoDto> {
    return this.produtoService.create(createProdutos);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Envia a imagem do produto (jpeg/png/webp, até 2 MB). Apenas Administradores',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagem salva' })
  @ApiResponse({ status: 400, description: 'Arquivo ausente ou tipo inválido' })
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
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
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
  @ApiOperation({ summary: 'Baixa a imagem do produto' })
  @ApiResponse({ status: 200, description: 'Arquivo da imagem' })
  @ApiResponse({ status: 404, description: 'Imagem não encontrada' })
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
