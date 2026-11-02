import { Injectable, NotFoundException } from '@nestjs/common';
import { ProdutoDto } from './dto/produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity.js';
import { InjectRepository } from '@nestjs/typeorm';

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

  async update(id: number, updatedProduct: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    Object.assign(produto, updatedProduct);
    console.log(produto);
    return this.produtoRepository.save(produto);
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
