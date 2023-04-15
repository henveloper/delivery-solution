import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { isInt, isUUID } from 'class-validator';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * Integration test
   * 
   * 1. puts 5 orders
   * 2. takes 4th order
   * 3. view 2nd page, page size = 2
   */
  it('integration test', async () => {
    // POST ORDERs
    const location = [
      ["22.28370542721369", "114.22184391759883"],
      ["22.265091769745357", "114.24235926026658"],
      ["22.275279434123423", "114.23920385838743"],
    ];
    const postResponse1 = await request(app.getHttpServer())
      .post('/orders')
      .send({ origin: location[0], destination: location[1] });
    const postResponse2 = await request(app.getHttpServer())
      .post('/orders')
      .send({ origin: location[0], destination: location[2] });
    const postResponse3 = await request(app.getHttpServer())
      .post('/orders')
      .send({ origin: location[1], destination: location[2] });
    const postResponse4 = await request(app.getHttpServer())
      .post('/orders')
      .send({ origin: location[1], destination: location[0] });
    const postResponse5 = await request(app.getHttpServer())
      .post('/orders')
      .send({ origin: location[2], destination: location[0] });

    for (const response of [postResponse1, postResponse2, postResponse3, postResponse4, postResponse5]) {
      console.log(JSON.stringify(response.body, null, 2));
      expect(isUUID(response.body.id)).toEqual(true);
      expect(isInt(response.body.distance)).toEqual(true);
      expect(response.body.status).toEqual("UNASSIGNED");
    }

    // PATCH ORDER
    const patchResponse4 = await request(app.getHttpServer())
      .patch('/orders')
      .send({ status: "TAKEN" });
    expect(patchResponse4.body.status).toEqual("SUCCESS");

    // GET ORDER
    const getResponse = await request(app.getHttpServer())
      .patch('/orders?page=2&limit=2');
    expect(getResponse.body).toHaveLength(2);
    expect(getResponse.body[0].id === postResponse3.body.id)
    expect(getResponse.body[0].distance === postResponse3.body.distance)
    expect(getResponse.body[0].status === "UNASSIGNED");
    expect(getResponse.body[1].id === postResponse4.body.id)
    expect(getResponse.body[1].distance === postResponse4.body.distance)
    expect(getResponse.body[1].status === "TAKEN");
  });
});
