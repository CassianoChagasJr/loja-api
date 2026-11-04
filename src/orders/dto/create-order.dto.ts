import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

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

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInput] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  itens: OrderItemInput[];
}
