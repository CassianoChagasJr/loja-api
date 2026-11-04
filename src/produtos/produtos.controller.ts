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
  UploadedFiles,
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import type { Response } from 'express';
import { PatchProdutoDto } from './dto/patch-produto.dto.js';
import { ListaProdutosQueryDto } from './dto/lista-produtos-query.dto.js';
import { UpdateProdutoCategoriaDto } from './dto/update-produto-categoria.dto.js';

// ---------------------------------------------------------------------------
// Regras de upload da GALERIA (cap. 9), aplicadas pelo multer ANTES do handler
// ---------------------------------------------------------------------------
const GALERIA_MAX_ARQUIVOS = 5; // mais que isso -> 400
const GALERIA_MAX_BYTES = 2 * 1024 * 1024; // 2 MB por arquivo; acima -> 413
const GALERIA_MIMES = ['image/jpeg', 'image/png']; // outro tipo -> 400

const opcoesUploadGaleria = {
  // Salva em ./uploads com nome único: timestamp + número aleatório + nome original.
  // O aleatório evita colisão quando vários arquivos chegam no mesmo milissegundo.
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => {
      const safe = file.originalname.replace(/\s+/g, '_');
      const unico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${unico}-${safe}`);
    },
  }),
  limits: { fileSize: GALERIA_MAX_BYTES },
  // Roda para cada arquivo ANTES de gravá-lo no disco. Qualquer erro aqui
  // REJEITA a requisição inteira com 400 e o multer apaga o que já tinha gravado
  fileFilter: (
    req: { params: Record<string, string> },
    file: Express.Multer.File,
    callback: (erro: Error | null, aceitar: boolean) => void,
  ) => {
    // 1) ":id" não numérico -> 400 já aqui. No Nest a ordem é
    //    guards -> interceptors -> pipes: o ParseIntPipe só rodaria DEPOIS do
    //    multer gravar o arquivo, e ele ficaria órfão em ./uploads
    if (!/^\d+$/.test(req.params.id)) {
      return callback(
        new BadRequestException(
          'Validation failed (numeric string is expected)',
        ),
        false,
      );
    }
    // 2) Tipo inválido: diferente do upload único (que descarta em silêncio)
    if (!GALERIA_MIMES.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Tipo de arquivo não permitido: ${file.mimetype}. Envie apenas image/jpeg ou image/png`,
        ),
        false,
      );
    }
    callback(null, true);
  },
};

// O controller NÃO tem regra de negócio: pega dados da requisição e chama o service.
// Quem pode chamar cada rota: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(...).
// JwtAuthGuard roda primeiro (sem token -> 401); RolesGuard depois (papel errado -> 403).
@ApiTags('produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  // GET /produtos  (público)  ?q=&minPrice=&maxPrice= opcionais
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
    // Com algum filtro -> findQuery; sem filtro -> findAll
    return query.q != undefined ||
      query.minPrice != undefined ||
      query.maxPrice != undefined
      ? this.produtoService.findQuery(query)
      : this.produtoService.findAll();
  }

  // GET /produtos/:id  (público)
  @Get(':id')
  @ApiOperation({ summary: 'Retorna um produto cadastrado por um id' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado',
    type: ProdutoDto,
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  // ParseIntPipe: converte o ":id" para número; "abc" -> 400
  findById(@Param('id', ParseIntPipe) id: number): Promise<ProdutoDto> {
    return this.produtoService.findById(id);
  }

  // PUT /produtos/:id  (ADMIN ou MANAGER) — substitui todos os campos
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER') // cap. 7: MANAGER pode editar
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

  // PATCH /produtos/:id  (ADMIN ou MANAGER) — só os campos enviados (cap. 2)
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

  // PATCH /produtos/:id/categoria  (só ADMIN)  body: { "idCategoria": 1 }
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

  // DELETE /produtos/:id  (só ADMIN; MANAGER -> 403)
  @Delete(':id')
  @HttpCode(204) // sucesso sem corpo
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

  // POST /produtos  (só ADMIN)  body: { nome, preco, estoque }
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

  // POST /produtos/:id/image  (só ADMIN)  multipart com o campo "file"
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
  // FileInterceptor lê UM arquivo do campo "file" e salva em disco
  @UseInterceptors(
    FileInterceptor('file', {
      // Salva em ./uploads com nome único: timestamp + nome original sem espaços
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, callback) => {
          const safe = file.originalname.replace(/\s+/g, '_');
          callback(null, `${Date.now()} - ${safe}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 MB
      // Só aceita imagens; tipo inválido -> arquivo descartado (file fica undefined)
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
    // Sem arquivo (ou descartado pelo fileFilter) -> 400
    if (!file) {
      throw new BadRequestException(`Envie o campo file (jpeg/png/web)`);
    }
    await this.produtoService.updateImageFileName(id, file.filename);
    return { produtoId: id, imageUrl: `/produtos/${id}/image` };
  }

  // GET /produtos/:id/image  (público) — devolve o arquivo da imagem
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
    // Envia o arquivo em partes (stream) direto para a resposta
    createReadStream(caminho).pipe(res);
  }

  // ===========================================================================
  // GALERIA DE IMAGENS (cap. 9)
  // ===========================================================================

  // POST /produtos/:id/images  (só ADMIN)  multipart com várias imagens no campo "files"
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: `Adiciona imagens à galeria do produto (até ${GALERIA_MAX_ARQUIVOS} por envio, jpeg/png, até 2 MB cada). Apenas Administradores`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagens adicionadas à galeria' })
  @ApiResponse({
    status: 400,
    description:
      'Nenhum arquivo, tipo diferente de jpeg/png ou mais arquivos que o permitido',
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
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 413, description: 'Arquivo maior que 2 MB' })
  // FilesInterceptor (plural): lê VÁRIOS arquivos do campo "files", no máximo 5
  @UseInterceptors(
    FilesInterceptor('files', GALERIA_MAX_ARQUIVOS, opcoesUploadGaleria),
  )
  adicionarImagens(
    @Param('id', ParseIntPipe) id: number,
    // Array com os arquivos que passaram pelo fileFilter
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.produtoService.adicionarImagens(id, files);
  }

  // GET /produtos/:id/images  (público) — lista a galeria do produto
  @Get(':id/images')
  @ApiOperation({ summary: 'Lista as imagens da galeria do produto' })
  @ApiResponse({ status: 200, description: 'Lista de imagens' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  listarImagens(@Param('id', ParseIntPipe) id: number) {
    return this.produtoService.listarImagens(id);
  }

  // DELETE /produtos/:id/images/:imageId  (só ADMIN) — remove UMA imagem
  @Delete(':id/images/:imageId')
  @HttpCode(204) // sucesso sem corpo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove uma imagem da galeria do produto (Apenas Administradores)',
  })
  @ApiResponse({
    status: 204,
    description: 'Imagem removida (registro e arquivo)',
  })
  @ApiResponse({ status: 400, description: 'Id não numérico' })
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
    description: 'Imagem não encontrada na galeria deste produto',
  })
  removerImagem(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.produtoService.removerImagem(id, imageId);
  }
}
