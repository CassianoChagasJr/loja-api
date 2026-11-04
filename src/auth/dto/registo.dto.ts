import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistroDto {
  @ApiProperty({ example: 'joao' })
  @IsString()
  @MinLength(2)
  username: string;

  @ApiProperty({ example: 'joao@loja.test' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
