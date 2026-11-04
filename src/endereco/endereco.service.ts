import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Endereco } from './endereco.entity.js';
import { Repository } from 'typeorm';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';

// Toda a regra de negócio de endereço fica aqui; o controller só repassa.
// Regra central: o usuário só enxerga e mexe nos PRÓPRIOS endereços.
@Injectable()
export class EnderecoService {
  constructor(
    // Acesso à tabela enderecos (liberado pelo forFeature no módulo)
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) {}

  // ---------------------------------------------------------------------------
  // POST /enderecos  -> cria o endereço com o dono vindo do token
  // ---------------------------------------------------------------------------
  async createForUser(
    dto: CreateEnderecoDto,
    usuarioId: number,
  ): Promise<Endereco> {
    // ...dto copia os campos do body; userId é acrescentado com o id do token
    const endereco = this.enderecoRepository.create({
      ...dto,
      userId: usuarioId,
    });

    return await this.enderecoRepository.save(endereco);
  }

  // ---------------------------------------------------------------------------
  // GET /enderecos  -> só os endereços do usuário logado
  // ---------------------------------------------------------------------------
  async findAllForUser(usuarioId: number): Promise<Endereco[]> {
    return await this.enderecoRepository.find({ where: { userId: usuarioId } });
  }

  // ---------------------------------------------------------------------------
  // Busca UM endereço respeitando o dono (usado pelo PUT, DELETE e pelo
  // PATCH /orders/:id/endereco). Filtra por id E userId na MESMA consulta:
  // não existe OU é de outro usuário -> mesmo 404 (não revela que existe)
  // ---------------------------------------------------------------------------
  async findOneForUser(id: number, usuarioId: number): Promise<Endereco> {
    const endereco = await this.enderecoRepository.findOne({
      where: { id, userId: usuarioId },
    });

    if (!endereco) {
      throw new NotFoundException(
        `Endereço ${id} não encontrado entre os seus endereços`,
      );
    }

    return endereco;
  }

  // ---------------------------------------------------------------------------
  // PUT /enderecos/:id  -> substitui os dados de um endereço do usuário
  // ---------------------------------------------------------------------------
  async updateForUser(
    id: number,
    dto: CreateEnderecoDto,
    usuarioId: number,
  ): Promise<Endereco> {
    // 1) Busca com regra de dono -> 404 se não for seu (o resto nem roda)
    const endereco = await this.findOneForUser(id, usuarioId);
    // 2) Copia os campos do body; id e userId não mudam (não estão no DTO)
    Object.assign(endereco, dto);

    return await this.enderecoRepository.save(endereco);
  }

  // ---------------------------------------------------------------------------
  // DELETE /enderecos/:id  -> apaga um endereço do usuário
  // Pedidos ligados a ele ficam com enderecoId = null (onDelete SET NULL no Order)
  // ---------------------------------------------------------------------------
  async removeForUser(id: number, usuarioId: number): Promise<void> {
    // 1) Busca com regra de dono -> 404 se não for seu
    const endereco = await this.findOneForUser(id, usuarioId);
    // 2) remove(entidade) e não delete(id): delete(id) apagaria sem checar o dono
    await this.enderecoRepository.remove(endereco);
  }
}
