import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  // Cria uma nova categoria
  async createCategoria(
    createCategoriaDto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const novaCategoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(novaCategoria);
  }

  // Lista todas as categorias cadastradas
  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find();
  }

  async findCategoriaById(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`Categoria com o ID: ${id} não encontrada`);
    }
    return categoria;
  }

  // Busca uma categoria específica junto com a lista de produtos (O que o desafio pede!)
  async findProductsByCategory(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: {
        produtos: true,
      }, // Faz o JOIN automático com os produtos vinculados
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
    return categoria;
  }

  // Atualiza os dados de uma categoria (PUT)
  async updateCategoria(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriaRepository.save(categoria);
  }

  // Deleta uma categoria
  async deleteCategoria(id: number): Promise<void> {
    const resultado = await this.categoriaRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
  }
}
