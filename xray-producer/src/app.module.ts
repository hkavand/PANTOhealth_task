import { Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import * as amqp from 'amqplib';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: process.env.NODE_ENV === process.env.TEST_ENV_NAME ?
            process.env.RABBITMQ_EXCHANGE_TEST || 'xray_exchange_test' :
            process.env.RABBITMQ_EXCHANGE || 'xray_exchange',
          type: 'direct',
        },
      ],
      uri: process.env.NODE_ENV === process.env.TEST_ENV_NAME ?
        process.env.RABBITMQ_URL : process.env.RABBITMQ_URL_TEST,
      connectionInitOptions: { wait: false },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap, OnApplicationShutdown {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onApplicationBootstrap() {
    // checking if we are in test mode and set config accordingly.
    const rabbitmq_uri = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_URL_TEST : process.env.RABBITMQ_URL;
    const exchange = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_EXCHANGE_TEST : process.env.RABBITMQ_EXCHANGE;
    const queue = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_QUEUE_TEST : process.env.RABBITMQ_QUEUE;
    const routingKey = process.env.NODE_ENV === process.env.TEST_ENV_NAME ? process.env.RABBITMQ_ROUTING_KEY_TEST : process.env.RABBITMQ_ROUTING_KEY;

    this.connection = await amqp.connect(rabbitmq_uri);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(exchange, 'direct', { durable: true });
    await this.channel.assertQueue(queue, { durable: true });

    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  async onApplicationShutdown() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}