import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './orders/orders.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CatalogoModule } from './catalogo/catalogo.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { EnderecoModule } from './endereco/endereco.module.js';
import { PagamentosModule } from './pagamentos/pagamentos.module.js';

// Módulo raiz: junta a configuração, o banco e todos os módulos de funcionalidade
@Module({
  imports: [
    ProdutosModule,
    // Lê o .env e deixa o ConfigService disponível em toda a aplicação
    ConfigModule.forRoot({ isGlobal: true }),
    // Conexão com o Postgres usando as variáveis DB_* do .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        // Registra automaticamente as entidades dos forFeature de cada módulo
        autoLoadEntities: true,
        // Cria/atualiza as tabelas a partir das entidades. Só em desenvolvimento
        synchronize: true,
      }),
    }),
    OrdersModule,
    AuthModule,
    CatalogoModule,
    CategoriasModule,
    EnderecoModule,
    PagamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
