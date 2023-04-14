import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DistanceService } from './distance.service';
import { GetOrderQueryDto, PatchOrderBodyDto, PatchOrderParamDto, PostOrderDto } from './order.dto';
import { isUUID } from 'class-validator';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            insert: async (...args) => undefined,
            takeOne: async (...args) => true,
            getSlice: async (...args) => [],
          } as Partial<OrderService>,
        },
        {
          provide: DistanceService,
          useValue: {
            getRouteLength: async (...args) => 1,
          } as Partial<DistanceService>,
        }
      ],
    })
      .compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("postOrder", async () => {
    const dto = new PostOrderDto();
    dto.origin = dto.destination = ["1", "1"];
    const result = await controller.postOrders(dto);

    expect(isUUID(result.id)).toEqual(true);
    expect(typeof result.distance).toEqual("number");
    expect(result.status).toEqual("UNASSIGNED");
  });

  it("patchOrder", async () => {
    const paramDto = new PatchOrderParamDto();
    paramDto.id = "uuid";
    const bodyDto = new PatchOrderBodyDto();
    bodyDto.status = "TAKEN";

    const result = await controller.patchOrders(bodyDto, paramDto);
    expect(result.status).toEqual("SUCCESS");
  });

  it("getOrder", async () => {
    const queryDto = new GetOrderQueryDto();
    queryDto.limit = "1";
    queryDto.page = "2";

    const result = await controller.getOrders(queryDto);
    expect(result).toBeDefined();
  });
});
