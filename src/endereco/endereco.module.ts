import { Module } from '@nestjs/common';
import { EnderecoService } from './endereco.service.js';
import { EnderecoController } from './endereco.controller.js';
import { Endereco } from './endereco.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // Libera o Repository<Endereco> para injeção no service
  imports: [TypeOrmModule.forFeature([Endereco])],
  providers: [EnderecoService],
  controllers: [EnderecoController],
  // Exporta o service para o OrdersModule reaproveitar a regra "endereço do dono"
  exports: [EnderecoService],
})
export class EnderecoModule {}
