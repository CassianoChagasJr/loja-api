import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './user.entity.js';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtAuthGuard } from './jwt.auth.guard.js';
import { RolesGuard } from './roles.guard.js';

@Module({
  imports: [
    // Libera o Repository<Usuario>
    TypeOrmModule.forFeature([Usuario]),
    // Configura o JwtService com o segredo e a validade do ACESSO_TOKEN (.env).
    // registerAsync: espera o ConfigService para ler as variáveis
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            config.get<JwtSignOptions['expiresIn']>('JWT_EXPIRES_IN') ?? '1h',
        },
      }),
    }),
    // Passport com a estratégia "jwt" como padrão
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  // Exporta os guards para os outros módulos usarem nas rotas protegidas
  exports: [AuthService, JwtModule, PassportModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
