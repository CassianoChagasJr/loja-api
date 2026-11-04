import { Controller, Delete, Get, Patch, Post, Put } from '@nestjs/common';
import { EnderecoService } from './endereco.service.js';

@Controller('endereco')
export class EnderecoController {

    constructor(private readonly enderecoService: EnderecoService) {}


    @Get('endereco')
    findAllEndereco() {
        return this.enderecoService.findAllEnderecoForUser();
    }
    @Post('endereco')
    createEndereco() {
        return this.enderecoService.createEndereco();
    }

    @Put('endereco/:id')
    updateEndereco() {
        return this.enderecoService.updateEndereco();
    }

    @Delete('endereco/:id')
    deleteEndereco() {
        return this.enderecoService.deleteEndereco();
    }

    @Patch('endereco/:id')
    patchEndereco() {
        return this.enderecoService.patchEndereco();
    }
}
