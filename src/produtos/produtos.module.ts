import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller.js';
import ProdutoService from './produto.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Produto])],
  controllers: [ProdutosController],
  providers: [ProdutoService],
})
export class ProdutosModule {}
