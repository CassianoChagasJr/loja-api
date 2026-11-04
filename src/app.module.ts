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
import { EnderecoModule } from './endereco/endereco.module.js';

//parei no video 31 de Josino - upload de arquivos

@Module({
  imports: [
    ProdutosModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, //cuidado com isso em produção, usar so em desenvolvimento
      }),
    }),
    OrdersModule,
    AuthModule,
    CatalogoModule,
    CategoriasModule,
    EnderecoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


