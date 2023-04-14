import { Test, TestingModule } from '@nestjs/testing';
import { DistanceService } from './distance.service';
import { ConfigModule } from '@nestjs/config';

// skipping this test due to cost concern
describe.skip('DistanceService', () => {
  let service: DistanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DistanceService],
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();

    service = module.get<DistanceService>(DistanceService);
  });

  it('test framework instantiated', () => {
    expect(service).toBeDefined();
  });

  // prevent excessive calls from watch mode
  describe("get distance", () => {
    it("skw to swh", async () => {
      const result = await service.getRouteLength(
        ["22.278369582195943", "114.2290403020166"],
        ["22.282326311280148", "114.22154930989171"],
      );
      expect(result).toEqual(1391);
    });
  });
});
