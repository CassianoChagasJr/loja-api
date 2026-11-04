import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registo.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt.auth.guard.js';
import { RefreshDto } from './dto/refresh.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Cadastra um usuário com perfil CLIENTE' })
  @ApiResponse({ status: 201, description: 'Usuário criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'username ou email já cadastrado' })
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto.username, dto.email, dto.password);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login: devolve acesso_token e refresh_token' })
  @ApiResponse({ status: 200, description: 'Tokens gerados' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dados do usuário logado (usuarioId, username, email, perfil)',
  })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({
    status: 401,
    description:
      'Não autorizado. Você precisa estar logado para ter acesso a este recurso',
  })
  me(@Req() req: { user: { usuarioId: number } }) {
    return this.authService.me(req.user.usuarioId);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Troca o refresh_token por um novo acesso_token' })
  @ApiResponse({ status: 200, description: 'Novo acesso_token' })
  @ApiResponse({ status: 400, description: 'refresh_token ausente' })
  @ApiResponse({
    status: 401,
    description: 'refresh token inválido ou expirado',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }
}
