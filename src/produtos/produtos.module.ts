import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller.js';
import ProdutoService from './produto.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';

@Module({
  imports: [
    // Produto e Categoria: o service valida a categoria antes de associar
    TypeOrmModule.forFeature([Produto, Categoria]),
    // Guards de autenticação/papel usados no controller
    AuthModule,
  ],
  controllers: [ProdutosController],
  providers: [ProdutoService],
  // Exporta o service para o CatalogoModule (resumo do catálogo)
  exports: [ProdutoService],
})
export class ProdutosModule {}
