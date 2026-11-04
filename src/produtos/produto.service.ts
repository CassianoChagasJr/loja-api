import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import {
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Produto } from './produto.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { PatchProdutoDto } from './dto/patch-produto.dto.js';
import { ListaProdutosQueryDto } from './dto/lista-produtos-query.dto.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { ProdutoImagem } from './produto-imagem.entity.js';

// Pasta onde o multer grava os arquivos (a mesma do upload de uma imagem)
const PASTA_UPLOADS = join(process.cwd(), 'uploads');

// Apaga um arquivo de ./uploads. Se ele já não existir, ignora o erro:
// o importante é o registro no banco, e não queremos 500 por arquivo sumido.
async function apagarArquivo(fileName: string): Promise<void> {
  await unlink(join(PASTA_UPLOADS, fileName)).catch(() => undefined);
}

// Toda a regra de negócio de produtos fica aqui; o controller só repassa.
// (Quem pode chamar cada rota é decidido no controller, pelos guards + @Roles)
@Injectable()
export default class ProdutoService {
  constructor(
    // Acesso às tabelas produtos e categorias (liberadas pelo forFeature no módulo)
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    // Tabela da galeria de imagens (cap. 9)
    @InjectRepository(ProdutoImagem)
    private readonly imagemRepository: Repository<ProdutoImagem>,
  ) {}

  // GET /produtos (sem filtros) -> todos os produtos
  findAll(): Promise<Produto[]> {
    return this.produtoRepository.find();
  }

  // GET /produtos/:id -> 404 se não existir
  async findById(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    return produto;
  }

  // ---------------------------------------------------------------------------
  // GET /produtos?q=&minPrice=&maxPrice=  (cap. 2)
  // Monta o WHERE aos poucos: só entra o filtro que foi enviado
  // ---------------------------------------------------------------------------
  async findQuery(query: ListaProdutosQueryDto): Promise<Produto[]> {
    const { q, minPrice, maxPrice } = query;
    const whereConditions: any = {};

    // 1) q = trecho do nome. ILike = LIKE sem diferenciar maiúscula/minúscula
    if (q) {
      whereConditions.nome = ILike(`%${q}%`);
    }
    // 2) Faixa de preço: entre os dois, só mínimo ou só máximo
    if (minPrice != undefined && maxPrice != undefined) {
      whereConditions.preco = Between(minPrice, maxPrice);
    } else if (minPrice != undefined) {
      whereConditions.preco = MoreThanOrEqual(minPrice);
    } else if (maxPrice != undefined) {
      whereConditions.preco = LessThanOrEqual(maxPrice);
    }

    return await this.produtoRepository.find({
      where: whereConditions,
    });
  }

  // ---------------------------------------------------------------------------
  // PUT e PATCH /produtos/:id -> mesmo método.
  // PUT recebe todos os campos (UpdateProdutoDto); PATCH só os enviados
  // (PatchProdutoDto). Object.assign copia apenas o que veio no body.
  // ---------------------------------------------------------------------------
  async update(
    id: number,
    updatedProduct: UpdateProdutoDto | PatchProdutoDto,
  ): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    Object.assign(produto, updatedProduct);
    return this.produtoRepository.save(produto);
  }

  // ---------------------------------------------------------------------------
  // PATCH /produtos/:id/categoria -> associa o produto a uma categoria
  // Erros: 404 (produto) -> 404 (categoria)
  // ---------------------------------------------------------------------------
  async updateCategoria(id: number, idCategoria: number): Promise<Produto> {
    // 1) Produto precisa existir -> 404
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    }
    // 2) Categoria precisa existir -> 404 (busca pelo idCategoria do body)
    const categoria = await this.categoriaRepository.findOne({
      where: { id: idCategoria },
    });
    if (!categoria) {
      throw new NotFoundException(
        `Categoria com id: ${idCategoria} não encontrada`,
      );
    }

    // 3) Grava a FK idCategoria no produto
    produto.idCategoria = idCategoria;
    return await this.produtoRepository.save(produto);
  }

  // DELETE /produtos/:id -> affected = 0 significa que nada foi apagado -> 404
  async delete(id: number): Promise<void> {
    const result = await this.produtoRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
  }

  // POST /produtos -> cria a partir do DTO já validado
  async create(createProdutos: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutos);
    return this.produtoRepository.save(produto);
  }

  // POST /produtos/:id/image -> guarda o nome do arquivo salvo em ./uploads
  async updateImageFileName(id: number, filename: string) {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    }
    produto.imageFileName = filename;
    return this.produtoRepository.save(produto);
  }

  // ===========================================================================
  // GALERIA DE IMAGENS (cap. 9)
  // MIME (jpeg/png), tamanho (2 MB) e quantidade (até 5) são barrados ANTES,
  // pelo FilesInterceptor no controller. Aqui ficam as regras de banco/arquivo.
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /produtos/:id/images  -> registra várias imagens na galeria do produto
  // Erros: 400 (nenhum arquivo) -> 404 (produto não existe)
  // ---------------------------------------------------------------------------
  async adicionarImagens(
    produtoId: number,
    arquivos: Express.Multer.File[],
  ): Promise<ProdutoImagem[]> {
    // 1) Nenhum arquivo no campo "files" -> 400
    if (!arquivos || arquivos.length === 0) {
      throw new BadRequestException(
        'Envie pelo menos uma imagem no campo files (jpeg/png)',
      );
    }

    // 2) Produto precisa existir -> 404.
    //    O multer já gravou os arquivos no disco ANTES de chegar aqui,
    //    então apagamos esses arquivos para não deixar lixo em ./uploads
    const produto = await this.produtoRepository.findOne({
      where: { id: produtoId },
    });
    if (!produto) {
      await Promise.all(arquivos.map((a) => apagarArquivo(a.filename)));
      throw new NotFoundException(
        `Produto com id: ${produtoId} não encontrado`,
      );
    }

    // 3) Uma linha na tabela produto_imagens para cada arquivo recebido
    const imagens = arquivos.map((arquivo) =>
      this.imagemRepository.create({
        produtoId,
        fileName: arquivo.filename,
        mimeType: arquivo.mimetype,
        tamanho: arquivo.size,
      }),
    );
    // save com array: insere todas de uma vez
    return this.imagemRepository.save(imagens);
  }

  // ---------------------------------------------------------------------------
  // GET /produtos/:id/images  -> lista a galeria de um produto
  // ---------------------------------------------------------------------------
  async listarImagens(produtoId: number): Promise<ProdutoImagem[]> {
    // Reaproveita o findById: produto inexistente -> 404
    await this.findById(produtoId);
    return this.imagemRepository.find({
      where: { produtoId },
      order: { id: 'ASC' },
    });
  }

  // ---------------------------------------------------------------------------
  // DELETE /produtos/:id/images/:imageId  -> remove UMA imagem da galeria
  // Erro: 404 se a imagem não existe OU é de outro produto
  // ---------------------------------------------------------------------------
  async removerImagem(produtoId: number, imagemId: number): Promise<void> {
    // 1) Busca por id da imagem E id do produto na MESMA consulta:
    //    /produtos/1/images/7 não apaga a imagem 7 se ela for do produto 2 -> 404
    const imagem = await this.imagemRepository.findOne({
      where: { id: imagemId, produtoId },
    });
    if (!imagem) {
      throw new NotFoundException(
        `Imagem ${imagemId} não encontrada na galeria do produto ${produtoId}`,
      );
    }

    // 2) Apaga o registro no banco e depois o arquivo em ./uploads
    await this.imagemRepository.remove(imagem);
    await apagarArquivo(imagem.fileName);
  }
}
