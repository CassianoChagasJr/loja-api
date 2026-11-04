import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { Repository } from 'typeorm';

// Regras de categoria. "Só ADMIN muta" é garantido no controller (RolesGuard + @Roles).
@Injectable()
export class CategoriasService {
  constructor(
    // Acesso à tabela categorias (liberado pelo forFeature no módulo)
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  // POST /categorias -> cria uma categoria
  async createCategoria(
    createCategoriaDto: CreateCategoriaDto,
  ): Promise<Categoria> {
    const novaCategoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(novaCategoria);
  }

  // GET /categorias -> lista todas
  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find();
  }

  // GET /categorias/:id -> 404 se não existir
  async findCategoriaById(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) {
      throw new NotFoundException(`Categoria com o ID: ${id} não encontrada`);
    }
    return categoria;
  }

  // GET /categorias/:id/produtos -> categoria + lista dos seus produtos
  async findProductsByCategory(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      // Carrega a relação @OneToMany "produtos" (JOIN automático)
      relations: {
        produtos: true,
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
    return categoria;
  }

  // PATCH /categorias/:id -> atualiza só o que veio (UpdateCategoriaDto é parcial)
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

  // DELETE /categorias/:id -> affected = 0 significa que nada foi apagado -> 404.
  // Produtos da categoria ficam com idCategoria = null (onDelete SET NULL no Produto)
  async deleteCategoria(id: number): Promise<void> {
    const resultado = await this.categoriaRepository.delete(id);
    if (resultado.affected === 0) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }
  }
}
