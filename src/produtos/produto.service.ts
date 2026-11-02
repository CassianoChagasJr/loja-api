import { Injectable, NotFoundException } from '@nestjs/common';
import { ProdutoDto } from './dto/produto.dto.js';
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

@Injectable()
export default class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  findAll(): Promise<Produto[]> {
    return this.produtoRepository.find();
  }

  async findById(id: number): Promise<Produto> {
    let produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    return produto;
  }

  async findQuery(query: ListaProdutosQueryDto): Promise<Produto[]> {
    const { q, minPrice, maxPrice } = query;
    const whereConditions: any = {};

    // 1. Filtro por substring no nome do produto
    if (q) {
      whereConditions.nome = ILike(`%${q}%`);
    }

    // 2. Filtro dinâmico por preço
    if (minPrice && maxPrice) {
      whereConditions.preco = Between(minPrice, maxPrice);
    } else if (minPrice) {
      whereConditions.preco = MoreThanOrEqual(minPrice);
    } else if (maxPrice) {
      whereConditions.preco = LessThanOrEqual(maxPrice);
    }

    return await this.produtoRepository.find({
      where: whereConditions,
    });
  }

  async update(
    id: number,
    updatedProduct: UpdateProdutoDto | PatchProdutoDto,
  ): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    Object.assign(produto, updatedProduct);
    console.log(produto);
    return this.produtoRepository.save(produto);
  }

  async updateCategoria(id: number, idCategoria: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com ID: ${id} não encontrado`);
    }

    produto.idCategoria = idCategoria;
    return await this.produtoRepository.save(produto);
  }

  async delete(id: number): Promise<void> {
    const result = await this.produtoRepository.delete(id);
    if (!result.affected)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
  }

  async create(createProdutos: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutos);
    return this.produtoRepository.save(produto);
  }

  async updateImageFileName(id: number, filename: string) {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(` Produto com ID: ${id} não encontrado`);
    }
    produto.imageFileName = filename;
    return this.produtoRepository.save(produto);
  }
}
