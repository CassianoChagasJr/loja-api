import { Injectable } from '@nestjs/common';
import ProdutoService from '../produtos/produto.service.js';

// GET /catalogo/summary (cap. 3)
@Injectable()
export class CatalogoService {
  // ProdutoService vem do ProdutosModule (exports), por injeção de dependência
  constructor(private readonly produtoService: ProdutoService) {}

  async getSummary() {
    // Reaproveita o findAll do ProdutoService (não acessa o banco direto)
    const produtos = await this.produtoService.findAll();

    // reduce: soma o estoque de todos os produtos, começando de 0
    const unidadesTotaisEstoque = produtos.reduce(
      (sum, item) => sum + item.estoque,
      0,
    );

    return {
      produtosTotaisCadastrados: produtos.length, // quantidade de produtos
      unidadesTotaisEmEstoque: unidadesTotaisEstoque, // soma de todo o estoque
    };
  }
}
