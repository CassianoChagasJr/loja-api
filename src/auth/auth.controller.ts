import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registo.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt.auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto.username, dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto){
    return this.authService.login(dto.username, dto.password)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: {user: {usuarioId: number}}){
    return this.authService.me(req.user.usuarioId)
  }
}
