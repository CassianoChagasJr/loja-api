import { PartialType } from '@nestjs/swagger';
import { UpdateProdutoDto } from './update-produto.dto.js';

export class PatchProdutoDto extends PartialType(UpdateProdutoDto) {}
