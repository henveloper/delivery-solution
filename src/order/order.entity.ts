import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Order {
    @PrimaryColumn()
    id: string;

    @Column()
    status: "UNASSIGNED" | "TAKEN";

    @Column()
    origin_lat: string;

    @Column()
    origin_lng: string;

    @Column()
    dest_lat: string;

    @Column()
    dest_lng: string;

    @Column()
    dist: number;
}