import { PartialType } from '@nestjs/swagger';
import { CreateProdutoDto } from './create-produto.dto.js';

// Cap. 2.1: mesmas validações do Create, mas todos os campos opcionais
export class PatchProdutoDto extends PartialType(CreateProdutoDto) {}
