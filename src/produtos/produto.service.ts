import { Injectable, NotFoundException } from '@nestjs/common';
import { ProdutoDto } from './dto/produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';

@Injectable()
export default class ProdutoService {
  private produtos: ProdutoDto[] = [];
  private nextId: number = 1;

  findAll(): ProdutoDto[] {
    return this.produtos;
  }

  findById(id: number): ProdutoDto {
    console.log('id recebido:', id);
    const produto = this.produtos.find((produto) => produto.id == id);
    if (!produto)
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    return produto;
  }

  update(id: number, updatedProduct: UpdateProdutoDto): ProdutoDto {
    const produto = this.produtos.find((produto) => produto.id == id);
    if (!produto)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    Object.assign(produto, updatedProduct);
    console.log(produto);
    return produto;
  }

  delete(id: number) {
    // buscar indice do produto no array
    const index = this.produtos.findIndex((produto) => produto.id == id);
    // se não encontrar exibir o NotFoundException
    if (index === -1)
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    // se encontrar, remover o produto do array
    this.produtos.splice(index, 1);
  }

  create(createProdutos: CreateProdutoDto): ProdutoDto {
    const { nome, preco, estoque } = createProdutos;
    const produtos: ProdutoDto = { id: this.nextId++, nome, preco, estoque };
    this.produtos.push(produtos);
    return produtos;
  }
}
