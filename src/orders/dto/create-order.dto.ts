import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

// Um item do pedido: { "idProduto": 1, "quantidade": 2 }
class OrderItemInput {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  idProduto: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantidade: number;
}

// Body do POST /orders -> { "itens": [ { "idProduto": 1, "quantidade": 2 } ] }
// userId NÃO vem no body: o dono vem do token
export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInput] })
  @IsArray()
  @ArrayMinSize(1) // pedido vazio -> 400
  // Valida cada item com as regras do OrderItemInput
  @ValidateNested({ each: true })
  // Converte cada objeto do JSON em OrderItemInput (sem isso a validação interna não roda)
  @Type(() => OrderItemInput)
  itens: OrderItemInput[];
}
