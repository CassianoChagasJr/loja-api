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
import { Categoria } from '../categorias/entities/categoria.entity.js';

@Injectable()
export default class ProdutoService {
  constructor(
    
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>
  ) {}

  findAll(): Promise<Produto[]> {
    return this.produtoRepository.find();
  }

  async findById(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
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
    if (minPrice !=  undefined && maxPrice != undefined) {
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

  async updateCategoria(id: number, idCategoria: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    const categoria = await this.categoriaRepository.findOne({where: {id}})

    if (!produto) {
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    }
    if(!categoria){
      throw new NotFoundException(`Categoria com id: ${id} não encontrada`)
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
      throw new NotFoundException(`Produto com id: ${id} não encontrado`);
    }
    produto.imageFileName = filename;
    return this.produtoRepository.save(produto);
  }
}
