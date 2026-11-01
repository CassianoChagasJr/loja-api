import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly orderService: OrdersService
    ){}

    @Post()
    create(@Body() dto: CreateOrderDto){
        return this.orderService.create(dto, 1)    
    }
}
