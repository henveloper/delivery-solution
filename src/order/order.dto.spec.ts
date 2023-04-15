import 'reflect-metadata';
import { GetOrderQueryDto, PatchOrderBodyDto, PatchOrderParamDto, PostOrderDto } from './order.dto';
import { validateSync } from 'class-validator';

describe('OrderDto', () => {
    describe('PostOrderDto', () => {
        it("pass for valid form", () => {
            const o = new PostOrderDto();
            o.origin = ["1", "1"];
            o.destination = ["1", "1"];
            expect(validateSync(o)).toHaveLength(0);
            expect(PostOrderDto.isValueValid(o)).toEqual(true);
        });

        describe("class validation fails", () => {
            it("not array", () => {
                const o = new PostOrderDto();
                o.origin = "1,1" as any;
                o.destination = ["1", "1"];
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("int", () => {
                const o = new PostOrderDto();
                o.origin = [1, "1"] as any;
                o.destination = ["1", "1"];
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("float", () => {
                const o = new PostOrderDto();
                o.origin = [1.5, "1"] as any;
                o.destination = ["1", "1"];
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("missing key", () => {
                const o = new PostOrderDto();
                o.origin = ["1", "1"];
            });

            it("bad array size", () => {
                const o = new PostOrderDto();
                o.origin = ["1", "1", "3"] as any;
                o.destination = ["1", "1"];
            });
        })

        describe("value validation fail", () => {
            it("lat", () => {
                const o = new PostOrderDto();
                o.origin = ["-90.5", "1"];
                o.destination = ["1", "1"];
                expect(PostOrderDto.isValueValid(o)).toEqual(false);
            })

            it("long", () => {
                const o = new PostOrderDto();
                o.origin = ["1", "1"];
                o.destination = ["1", "180.5"];
                expect(PostOrderDto.isValueValid(o)).toEqual(false);
            })
        });
    });

    describe("PatchOrderBodyDto", () => {
        it("pass for valid form", () => {
            const o = new PatchOrderBodyDto();
            o.status = "TAKEN";
            expect(validateSync(o).length).toEqual(0);
        });

        describe("failing cases", () => {
            it("missing key", () => {
                const o = new PatchOrderBodyDto();
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("bad type", () => {
                const o = new PatchOrderBodyDto();
                o.status = [] as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("wrong value", () => {
                const o = new PatchOrderBodyDto();
                o.status = "A" as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            })
        });
    });


    describe("PatchOrderParamDto", () => {
        it("pass for valid form", () => {
            const o = new PatchOrderParamDto();
            o.id = "b4db088c-f79e-4366-912b-9c36f727aee4";
            expect(validateSync(o).length).toEqual(0);
        });

        describe("failing cases", () => {
            it("missing key", () => {
                const o = new PatchOrderParamDto();
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("bad type", () => {
                const o = new PatchOrderParamDto();
                o.id = [] as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("wrong value", () => {
                const o = new PatchOrderParamDto();
                o.id = "A" as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            })
        });
    });

    describe("GetOrderQueryDto", () => {
        it("pass for valid form", () => {
            const o = new GetOrderQueryDto();
            o.limit = "1";
            o.page = "2";
            expect(validateSync(o).length).toEqual(0);
        });

        describe("failing cases", () => {
            it("missing keys", () => {
                const o = new GetOrderQueryDto();
                o.page = "1";
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("bad type", () => {
                const o = new GetOrderQueryDto();
                o.page = "1";
                o.limit = {} as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            });

            it("Not", () => {
                const o = new GetOrderQueryDto();
                o.page = "1";
                o.limit = {} as any;
                expect(validateSync(o).length).toBeGreaterThan(0);
            });
        });

    });
});
