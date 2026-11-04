import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaDto } from './create-categoria.dto.js';

// Body do PATCH /categorias/:id: mesmas regras do Create, todos os campos opcionais
export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
