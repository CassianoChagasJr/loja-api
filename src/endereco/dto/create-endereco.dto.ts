import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Body do POST /enderecos e do PUT /enderecos/:id (PUT substitui tudo, então
// exige os mesmos campos da criação).
// NÃO tem userId: o dono vem do token. Se o cliente mandar userId, o
// forbidNonWhitelisted devolve 400.
export class CreateEnderecoDto {
  @ApiProperty({ example: 'Rua das Flores' })
  @IsNotEmpty() // @IsString sozinho aceitaria ""
  @IsString()
  rua: string;

  @ApiProperty({ example: '123' })
  @IsNotEmpty()
  @IsString()
  numero: string;

  @ApiPropertyOptional({ example: 'Apto 404' })
  @IsOptional() // pode não vir; se vier, precisa ser texto
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
