import 'dotenv/config';
process.env.NODE_ENV = process.env.TEST_ENV_NAME;
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as amqp from 'amqplib';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let channel: amqp.Channel;
  let connection: amqp.Connection;

  async function consumeMessageFromQueue(queueName: string, rabbitmqUrl: string): Promise<any> {
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    await channel.assertQueue(queueName);

    const message = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout: No message received from queue "${queueName}" within ${1000}ms`));
      }, 1000);

      channel.consume(
        queueName,
        (msg) => {
          if (msg) {
            clearTimeout(timer);
            const content = JSON.parse(msg.content.toString());
            channel.ack(msg);
            resolve(JSON.parse(content));
          }
        },
        { noAck: false },
      );
    });

    await channel.close();
    await connection.close();
    return message;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/send-xray (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/send-xray')
      .expect(200);

    expect(response.body).toEqual({
      message: 'X-ray data sent successfully',
    });

    const queueName = process.env.RABBITMQ_QUEUE_TEST || 'xray_queue_test';
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    const message = await consumeMessageFromQueue(queueName, rabbitmqUrl);

    expect(message).toHaveProperty('time');
  });
});
