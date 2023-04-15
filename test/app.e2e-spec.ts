import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isInt, isUUID } from 'class-validator';
import { v4 } from 'uuid';

jest.setTimeout(60 * 1000);
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe("api tests", () => {
    describe("place order", () => {
      it("normal flow", async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .send({
            origin: ["22.28370542721369", "114.22184391759883"],
            destination: ["22.265091769745357", "114.24235926026658"],
          });

        expect(response.status).toEqual(200);
        expect(isUUID(response.body.id)).toEqual(true);
        expect(isInt(response.body.distance)).toEqual(true);
        expect(response.body.status).toEqual("UNASSIGNED");
      });

      it("fails for bad input (not string)", async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .send({
            origin: [22, "114.22184391759883"],
            destination: ["22.265091769745357", "114.24235926026658"],
          });

        expect(response.status).toEqual(400);
        expect(typeof response.body.error).toEqual("string");
      });

      it("fails for bad input (missing key)", async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .send({
            destination: ["22.265091769745357", "114.24235926026658"],
          });

        expect(response.status).toEqual(400);
        expect(typeof response.body.error).toEqual("string");
      });

      it("fails for bad input (out of bounds)", async () => {
        const failingBody = [
          {
            origin: ["-90.0001", "114.22184391759883"],
            destination: ["22.265091769745357", "114.24235926026658"],
          },
          {
            origin: ["90.00001", "114.22184391759883"],
            destination: ["22.265091769745357", "114.24235926026658"],
          },
          {
            origin: ["22.28370542721369", "-180.000001"],
            destination: ["22.265091769745357", "114.24235926026658"],
          },
          {
            origin: ["22.28370542721369", "180.000001"],
            destination: ["22.265091769745357", "114.24235926026658"],
          },
        ];
        for (const body of failingBody) {
          const response = await request(app.getHttpServer())
            .post('/orders')
            .send(body);

          expect(response.status).toEqual(400);
          expect(response.body.error).toEqual("Invalid lat/lng values.");
        }

      });

      it("fails for bad input (bogus locations)", async () => {
        const response = await request(app.getHttpServer())
          .post('/orders')
          .send({
            origin: ["20.866144508982988", "113.98692141591927"],
            destination: ["-58.59876912195435", "-8.544627857886157"],
          });

        expect(response.status).toEqual(400);
        expect(response.body.error).toEqual("gmap data error - ZERO_RESULTS");
      });
    });

    describe("take order", () => {
      const id = "276d8846-492a-408a-abc1-da635aa4bad0";
      it("normal flow", async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${id}`)
          .send({ status: "TAKEN" });
        expect(response.status).toEqual(200);
        expect(response.body.status).toEqual("SUCCESS");
      });

      it("fails for bad input (not uuid)", async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/a`)
          .send({ status: "TAKEN" });
        expect(response.status).toEqual(400);
        expect(typeof response.body.error).toEqual("string");
      });

      it("fails for bad input (bad request body)", async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${id}`)
          .send({ status: "taken" });
        expect(response.status).toEqual(400);
        expect(typeof response.body.error).toEqual("string");
      });

      it("fails for bad input (arbitary uuid)", async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${v4()}`)
          .send({ status: "TAKEN" });
        expect(response.status).toEqual(400);
        expect(response.body.error).toEqual("Order id invalid / order taken");
      });

      it("fails for bad input (order taken)", async () => {
        const response = await request(app.getHttpServer())
          .patch(`/orders/${id}`)
          .send({ status: "TAKEN" });
        expect(response.status).toEqual(400);
        expect(response.body.error).toEqual("Order id invalid / order taken");
      });
    });

    describe("list orders", () => {
      it("normal flow", async () => {
        const response1 = await request(app.getHttpServer())
          .get('/orders?page=1&limit=5');
        expect(response1.status).toEqual(200);
        expect(response1.body).toHaveLength(5);
        for (const entry of response1.body) {
          expect(isUUID(entry.id)).toEqual(true);
          expect(isInt(entry.distance)).toEqual(true);
          expect(entry.status === "UNASSIGNED" || entry.status === "TAKEN").toEqual(true);
        }

        const response2 = await request(app.getHttpServer())
          .get('/orders?page=3&limit=2');

        // assert result2[0] in result1
        expect((response1.body as any[]).some(e => e.id === response2.body[0].id)).toEqual(true);
        // assert result2[1] not in result1
        expect((response1.body as any[]).some(e => e.id === response2.body[1].id)).toEqual(false);
      });

      it("normal flow, empty list", async () => {
        const response1 = await request(app.getHttpServer())
          .get('/orders?page=1000000&limit=1');
        expect(response1.status).toEqual(200);
        expect(response1.body).toHaveLength(0);
      });

      it("fails for bad input (missing key)", async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?limit=5');
        expect(response.status).toEqual(400);
        expect(typeof response.body.error).toEqual("string");
      });

      it("fails for bad input (bad value)", async () => {
        const response = await request(app.getHttpServer())
          .get('/orders?page=3.5&limit=5');
        expect(response.status).toEqual(400);
        expect(response.body.error).toEqual("Bad page/limit values.");
      });
    });
  });

  describe("integration tests", () => {
    /**
     * 1. puts 4 orders
     * 2. takes 3th order
     * 3. view 2nd page, page size = 2
     */
    it('full api flow', async () => {
      // POST ORDERs
      const location = [
        ["22.28370542721369", "114.22184391759883"],
        ["22.265091769745357", "114.24235926026658"],
        ["22.275279434123423", "114.23920385838743"],
      ];
      const postResponse1 = await request(app.getHttpServer())
        .post('/orders')
        .send({ origin: location[0], destination: location[1] });
      await new Promise(res => setTimeout(() => res(1), 1000));
      const postResponse2 = await request(app.getHttpServer())
        .post('/orders')
        .send({ origin: location[0], destination: location[2] });
      const postResponse3 = await request(app.getHttpServer())
        .post('/orders')
        .send({ origin: location[1], destination: location[2] });
      const postResponse4 = await request(app.getHttpServer())
        .post('/orders')
        .send({ origin: location[1], destination: location[0] });

      for (const response of [postResponse1, postResponse2, postResponse3, postResponse4]) {
        expect(response.status).toEqual(200);
        expect(isUUID(response.body.id)).toEqual(true);
        expect(isInt(response.body.distance)).toEqual(true);
        expect(response.body.status).toEqual("UNASSIGNED");
      }

      // PATCH ORDER
      const patchResponse3 = await request(app.getHttpServer())
        .patch(`/orders/${postResponse3.body.id}`)
        .send({ status: "TAKEN" });
      expect(patchResponse3.status).toEqual(200);
      expect(patchResponse3.body.status).toEqual("SUCCESS");

      // GET ORDER
      const getResponse = await request(app.getHttpServer())
        .get('/orders?page=2&limit=2');
      expect(getResponse.status).toEqual(200);
      expect(getResponse.body).toHaveLength(2);
      expect(getResponse.body[0].id === postResponse3.body.id)
      expect(getResponse.body[0].distance === postResponse3.body.distance)
      expect(getResponse.body[0].status === "TAKEN");
      expect(getResponse.body[1].id === postResponse4.body.id)
      expect(getResponse.body[1].distance === postResponse4.body.distance)
      expect(getResponse.body[1].status === "UNASSIGNED");
    });

    /**
     * tests race condition for patch api by concurrent requests.
     */
    it("tests patch race condition", async () => {
      // use an unassigned row and shoot lots of requests to it
      const id = "bc7adadd-dc7d-42a8-9049-9709fac73e3c";
      const COUNT = 50;
      const promises: Array<Promise<request.Response>> = [];
      for (let i = 0; i < COUNT; i++) {
        promises.push(request(app.getHttpServer()).patch(`/orders/${id}`));
      }

      const responses = await Promise.all(promises);
      let okCount = 0;
      for (const response of responses) {
        if (response.status === 200) {
          okCount++;
        }
      }
      expect(okCount).toEqual(1);
    });
  });

});
