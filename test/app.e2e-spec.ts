import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

async function doWithLog(func: Promise<any>, beforelog: string, afterlog: string, log: boolean = false) {
  if (log) console.log(beforelog);
  await func;
  if (log) console.log(afterlog);
}

// Mock RabbitMQ-related components
jest.mock('@golevelup/nestjs-rabbitmq', () => ({
  RabbitMQModule: {
    forRoot: jest.fn(),
  },
  AmqpConnection: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
  })),
  RabbitSubscribe: jest.fn(() => () => { }), // Mock the RabbitSubscribe decorator
}));

// Mock the RabbitmqModule itself
jest.mock('../src/rabbitmq/rabbitmq.module', () => ({
  RabbitmqModule: jest.fn(),
}));

describe('XrayController (e2e)', () => {
  let app: INestApplication;
  let xrayModel: Model<any>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
    xrayModel = app.get<Model<any>>(getModelToken('Xray'));
  });


  // Just to make sure the database is clean before each test.
  beforeEach(async () => {
    if (xrayModel) {
      await xrayModel.deleteMany({});
    }
  });

  // Just to make double sure :) the database is clean before each test.
  afterEach(async () => {
    if (xrayModel) {
      await xrayModel.deleteMany({});
    }
  });

  it('/xrays (POST)', async () => {
    const payload = {
      "66bb584d4ae73e488c30a072": {
        data: [1, 2, 3, 4],
        time: 1735683480000,
      },
    };

    const res = await request(app.getHttpServer())
      .post('/xrays')
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('deviceId', '66bb584d4ae73e488c30a072');
  });

  it('/xrays (GET)', async () => {
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    };

    await xrayModel.create(testData);

    const response = await request(app.getHttpServer())
      .get('/xrays')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]).toMatchObject(testData);
  });

  it('/xrays/:id (GET)', async () => {
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    };

    const createdXray = await xrayModel.create(testData);

    const response = await request(app.getHttpServer())
      .get(`/xrays/${createdXray._id}`)
      .expect(200);

    console.log('Response body:', response.body);

    expect(response.body).toHaveProperty('_id', createdXray._id.toString());
    expect(response.body).toMatchObject(testData);
  });

  it('/xrays/:id (GET) - not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app.getHttpServer())
      .get(`/xrays/${nonExistentId}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: `Xray with ID ${nonExistentId} not found`
    });
  });

  it('/xrays/:id (PUT)', async () => {
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    };

    const createdXray = await xrayModel.create(testData);

    const updateRequest = {
      "66bb584d4ae73e488c30a072": {
        "data": [1, 2, 3, 4, 5],
        "time": 1735683480000
      }
    }

    const updatedData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 5,
    };

    const response = await request(app.getHttpServer())
      .put(`/xrays/${createdXray._id}`)
      .send(updateRequest)
      .expect(200);

    expect(response.body.updatedXray).toHaveProperty('_id', createdXray._id.toString());
    expect(response.body.updatedXray).toMatchObject(updatedData);
  });

  it('/xrays/filter (GET)', async () => {
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    };

    await xrayModel.create(testData);

    const response = await request(app.getHttpServer())
      .get('/xrays/filter')
      .query({ deviceId: '66bb584d4ae73e488c30a072', time: 1735683480000 })
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]).toMatchObject(testData);
  });

  it('/xrays/filter (GET) - no results', async () => {
    // Ensure no data exists for this deviceId and time
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    }

    await xrayModel.create(testData);

    const response = await request(app.getHttpServer())
      .get('/xrays/filter')
      .query({ deviceId: 'nonexistent_device', time: 1735683480000 })
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
  });

  it('/xrars/:id (DELETE)', async () => {
    const testData = {
      deviceId: '66bb584d4ae73e488c30a072',
      time: 1735683480000,
      dataLength: 4,
    };

    const createdXray = await xrayModel.create(testData);

    const response = await request(app.getHttpServer())
      .delete(`/xrays/${createdXray._id}`)
      .expect(200);

    expect(response.body).toHaveProperty('_id', createdXray._id.toString());
    expect(response.body).toMatchObject(testData);

    const deletedXray = await xrayModel.findById(createdXray._id);
    expect(deletedXray).toBeNull();
  });

  it('/xrays/:id (DELETE) - not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app.getHttpServer())
      .delete(`/xrays/${nonExistentId}`)
      .expect(404);

    expect(response.body).toEqual({
      statusCode: 404,
      message: `Xray with ID ${nonExistentId} not found`
    });
  });

  afterAll(async () => {
    // we can use the logs to debug if needed,
    // only need to pass a true argument at the end of the doWithLog function

    await doWithLog(app.close(), 'NestJS application closing...', 'NestJS application closed.');

    if (mongoServer) await doWithLog(mongoServer.stop(), 'In-memory MongoDB server stopping...', 'In-memory MongoDB server stopped.');

    await doWithLog(mongoose.disconnect(), 'Mongoose disconnecting...', 'Mongoose disconnected.');
  });

});