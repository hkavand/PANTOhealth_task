import 'dotenv/config';
process.env.NODE_ENV = process.env.TEST_ENV_NAME;
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as amqp from 'amqplib';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';



async function doWithLog(func: Promise<any>, beforelog: string, afterlog: string, log: boolean = false) {
  if (log) console.log(beforelog);
  await func;
  if (log) console.log(afterlog);
}

describe('XrayController (e2e)', () => {
  let app: INestApplication;
  let xrayModel: Model<any>;
  let mongoServer: MongoMemoryServer;
  let amqpConnection: AmqpConnection;

  async function publishMessage() {
    const rabbitmqUrl = process.env.RABBITMQ_URL_TEST
    const exchangeName = process.env.RABBITMQ_EXCHANGE_TEST || '';
    const routingKey = process.env.RABBITMQ_ROUTING_KEY_TEST || '';
    const queueName = process.env.RABBITMQ_QUEUE_TEST;

    const message = {
      '66bb584d4ae73e488c30a072': {
        'data': [1, 2, 3, 4],
      },
      time: Date.now(),
    };

    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, routingKey);

    if (amqpConnection == undefined) {
      amqpConnection = amqpConnection = app.get<AmqpConnection>(AmqpConnection);
    }

    await amqpConnection.publish(exchangeName, routingKey, JSON.stringify(message));
    await channel.close();
    await connection.close();
    return message;
  }

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

  it('RabbitMQ message handling', async () => {
    const message = await publishMessage();

    const deviceId = Object.keys(message)[0];
    const data = await xrayModel.find().exec()
    expect(data.length).toBe(1);
    expect(data[0]).toHaveProperty('deviceId', deviceId);
    expect(data[0]).toHaveProperty('time', message.time);
  });

  afterAll(async () => {
    // we can use the logs to debug if needed,
    // only need to pass a true argument at the end of the doWithLog function

    await doWithLog(app.close(), 'NestJS application closing...', 'NestJS application closed.');

    if (mongoServer) await doWithLog(mongoServer.stop(), 'In-memory MongoDB server stopping...', 'In-memory MongoDB server stopped.');

    await doWithLog(mongoose.disconnect(), 'Mongoose disconnecting...', 'Mongoose disconnected.');

    await doWithLog(amqpConnection.close(), 'RabbitMQ connection closing...', 'RabbitMQ connection closed.');
  });

});