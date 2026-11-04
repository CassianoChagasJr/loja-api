import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Body do POST /auth/refresh -> { "refresh_token": "eyJ..." }
export class RefreshDto {
  @ApiProperty({ description: 'refresh_token recebido no login' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
