import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { GetOrderQueryDto, PatchOrderBodyDto, PatchOrderParamDto, PostOrderDto } from './order.dto';
import { OrderService } from './order.service';
import { DistanceService } from './distance.service';
import { v4 } from 'uuid';
import { ErrorFilter } from '../error.filter';
import { HttpExceptionFilter } from '../http-exception.filter';
import { ValidationError } from 'class-validator';

@UsePipes(new ValidationPipe({
    transform: true,
    exceptionFactory: (validationErrors: ValidationError[]) => {
        return new HttpException(validationErrors.map(e => e.toString()).join(", "), HttpStatus.BAD_REQUEST);
    }
}))
@UseFilters(ErrorFilter, HttpExceptionFilter)
@Controller('/orders')
export class OrderController {
    constructor(
        public readonly orderService: OrderService,
        public readonly distanceService: DistanceService,
    ) {
        // pass
    }

    @Post("/")
    @HttpCode(200)
    public async postOrders(@Body() body: PostOrderDto) {
        if (!PostOrderDto.isValueValid(body)) {
            throw new HttpException("Invalid lat/lng values.", HttpStatus.BAD_REQUEST);
        }

        let distance: number;
        try {
            distance = await this.distanceService.getRouteLength(body.origin, body.destination);
        } catch (err) {
            if (err instanceof Error) {
                throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
            }
        }

        const uuid = v4();

        await this.orderService.insert(
            uuid,
            "UNASSIGNED",
            body.origin,
            body.destination,
            distance,
        );

        return {
            id: uuid,
            distance,
            status: "UNASSIGNED",
        };
    }

    @Patch("/:id")
    @HttpCode(200)
    public async patchOrders(@Body() body: PatchOrderBodyDto, @Param() param: PatchOrderParamDto) {
        console.log(body, param)
        const assigned = await this.orderService.takeOne(param.id);
        if (!assigned) {
            console.log(3);
            throw new HttpException("Order id invalid / order taken", HttpStatus.BAD_REQUEST);
        }

        return {
            status: "SUCCESS"
        };
    }

    @Get("/")
    @HttpCode(200)
    public async getOrders(@Query() query: GetOrderQueryDto) {
        if (!GetOrderQueryDto.isValueValid(query)) {
            throw new HttpException("Bad page/limit values.", HttpStatus.BAD_REQUEST);
        }

        const slice = await this.orderService.getSlice((+query.page - 1) * +query.limit, +query.limit);
        return slice;
    }
}
