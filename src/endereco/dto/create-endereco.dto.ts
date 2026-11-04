import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEnderecoDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  rua: string;
  @ApiProperty({ example: '123' })
  @IsString()
  numero: string;
  @ApiProperty({ example: 'Apto 404' })
  @IsString()
  complemento: string;
  @ApiProperty({ example: 'Recife' })
  @IsString()
  cidade: string;
  @ApiProperty({ example: 'PE' })
  @IsString()
  estado: string;
  @ApiProperty({ example: '50000-000' })
  @IsString()
  cep: string;
}
