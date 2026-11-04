import { Injectable, NotFoundException } from '@nestjs/common';
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
}
