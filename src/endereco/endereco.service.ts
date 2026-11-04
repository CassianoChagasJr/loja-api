import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Endereco } from './endereco.entity.js';
import { Repository } from 'typeorm';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';

@Injectable()
export class EnderecoService {
  constructor(
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) {}

  async createForUser(
    dto: CreateEnderecoDto,
    usuarioId: number,
  ): Promise<Endereco> {
    const endereco = this.enderecoRepository.create({
      ...dto,
      userId: usuarioId,
    });

    return await this.enderecoRepository.save(endereco);
  }

  async findAllForUser(usuarioId: number): Promise<Endereco[]> {
    return await this.enderecoRepository.find({ where: { userId: usuarioId } });
  }

  async findOneForUser(id: number, usuarioId: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({
      where: { id, userId: usuarioId },
    });

    if (!endereco) {
      throw new NotFoundException(`Endereço ${id} não encontrado entre os seus endereços`);
    }

    return endereco;
  }

  async updateForUser(
    id: number,
    dto: CreateEnderecoDto,
    usuarioId: number,
  ): Promise<Endereco> {
    const endereco = await this.findOneForUser(id, usuarioId);
    Object.assign(endereco, dto);

    return await this.enderecoRepository.save(endereco);
  }

  async removeForUser(id: number, usuarioId: number): Promise<void> {
    const endereco = await this.findOneForUser(id, usuarioId);
    await this.enderecoRepository.remove(endereco);
  }
}
