import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ProdutoDto } from './dto/produto.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import ProdutoService from './produto.service.js';

//parei no video 15.2 de Josino - Diagramas de projeto e documentação

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  findAll(): Promise<ProdutoDto[]> {
    return this.produtoService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<ProdutoDto> {
    return this.produtoService.findById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updatedProduct: UpdateProdutoDto,
  ): Promise<ProdutoDto> {
    return this.produtoService.update(id, updatedProduct);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: number): Promise<void> {
    return this.produtoService.delete(id);
  }

  @Post()
  create(@Body() createProdutos: CreateProdutoDto): Promise<ProdutoDto> {
    return this.produtoService.create(createProdutos);
  }
}
