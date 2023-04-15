import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isInt, isUUID } from 'class-validator';

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
