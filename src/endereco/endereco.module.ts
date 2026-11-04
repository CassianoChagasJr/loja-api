import { Module } from '@nestjs/common';
import { EnderecoService } from './endereco.service.js';
import { EnderecoController } from './endereco.controller.js';
import { Endereco } from './endereco.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Endereco])],
  providers: [EnderecoService],
  controllers: [EnderecoController],
})
export class EnderecoModule {}
