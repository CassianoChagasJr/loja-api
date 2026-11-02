import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller.js';
import ProdutoService from './produto.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Produto]), AuthModule],
  controllers: [ProdutosController],
  providers: [ProdutoService],
})
export class ProdutosModule {}
