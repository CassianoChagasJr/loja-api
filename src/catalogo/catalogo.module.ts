import { Module } from '@nestjs/common';
import { CatalogoService } from './catalogo.service.js';
import { CatalogoController } from './catalogo.controller.js';
import { ProdutosModule } from '../produtos/produtos.module.js';

@Module({
  // ProdutosModule exporta o ProdutoService, usado no resumo
  imports: [ProdutosModule],
  controllers: [CatalogoController],
  providers: [CatalogoService],
})
export class CatalogoModule {}
