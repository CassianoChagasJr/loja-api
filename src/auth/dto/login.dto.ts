import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

// Body do POST /auth/login -> { "username": "ana", "password": "secret123" }
export class LoginDto {
  @ApiProperty({ example: 'ana' })
  @IsString()
  @MinLength(2)
  username: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password: string;
}
