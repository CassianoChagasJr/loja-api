import { Order } from "./order.entity.js"


export class OrderItem{
    id: number
    idProduto: number
    quantidade: number
    precoUnico: number
    order: Order
}