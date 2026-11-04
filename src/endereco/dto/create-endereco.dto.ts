import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnderecoDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsNotEmpty()
  @IsString()
  rua: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  @IsString()
  numero: string;

  @ApiPropertyOptional({ example: 'Apto 404' })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({ example: 'Boa Viagem' })
  @IsNotEmpty()
  @IsString()
  bairro: string;

  @ApiProperty({ example: 'Recife' })
  @IsNotEmpty()
  @IsString()
  cidade: string;

  @ApiProperty({ example: 'PE' })
  @IsNotEmpty()
  @IsString()
  estado: string;

  @ApiProperty({ example: '50000-000' })
  @IsNotEmpty()
  @IsString()
  cep: string;
}
