import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

class OrderItemInput {
  @IsInt()
  @Min(1)
  produtoId: number;

  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  itens: OrderItemInput[];
}
