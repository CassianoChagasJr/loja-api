import { Injectable } from '@nestjs/common';
import ProdutoService from '../produtos/produto.service.js';

@Injectable()
export class CatalogoService {
  // Injeta o serviço de produtos usando a Injeção de Dependência (DI)
  constructor(private readonly produtoService: ProdutoService) {}

  async getSummary() {
    // Busca todos os produtos do banco usando o método que você já foi criado
    const produtos = await this.produtoService.findAll();

    // Calcula o total de unidades somando o estoque de cada produto
    const unidadesTotaisEstoque = produtos.reduce(
      (sum, item) => sum + item.estoque,
      0,
    );

    return {
      produtosTotais: produtos.length, // Quantidade de registros na tabela
      unidadesTotaisEstoque: unidadesTotaisEstoque, // Soma de todo o estoque
    };
  }
}
