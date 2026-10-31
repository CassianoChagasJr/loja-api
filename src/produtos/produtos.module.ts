import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller.js';
import ProdutoService from './produto.service.js';

@Module({
  controllers: [ProdutosController],
  providers: [ProdutoService],
})
export class ProdutosModule {}
