import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'refresh_token recebido no login' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
