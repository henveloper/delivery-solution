import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    ) {
        // pass
    }

    /**
     * insert into database
     * @param id 
     * @param status 
     * @param origin 
     * @param destination 
     * @param dist 
     * @returns 
     */
    public async insert(id: string, status: "UNASSIGNED", origin: [string, string], destination: [string, string], dist: number) {
        await this.orderRepository.insert({
            id,
            status,
            origin_lat: origin[0],
            origin_lng: origin[1],
            dest_lat: destination[0],
            dest_lng: destination[1],
            dist,
        });
    }

    /**
     * performs atomic update
     * @param id 
     * @returns whether an order is taken
     */
    public async takeOne(id: string): Promise<boolean> {
        const updateResult = await this.orderRepository.update({ id, status: "UNASSIGNED" }, { status: "TAKEN" });
        return updateResult.affected === 1;
    }

    /**
     * return a slice of the orders
     * @param offset 
     * @param limit 
     * @returns 
     */
    public async getSlice(offset: number, limit: number) {
        const rows = await this.orderRepository.find({
            select: ["id", "dist", "status"] as any,
            skip: offset,
            take: limit,
        });
        return rows.map(r => ({
            id: r.id,
            distance: r.dist,
            status: r.status,
        }));
    }
}
