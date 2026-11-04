import { PartialType } from '@nestjs/swagger';
import { CreateProdutoDto } from './create-produto.dto.js';

// Body do PATCH /produtos/:id (cap. 2.1).
// PartialType copia as validações do CreateProdutoDto e torna todos os campos
// opcionais: só o que vier no body é validado e alterado.
export class PatchProdutoDto extends PartialType(CreateProdutoDto) {}
