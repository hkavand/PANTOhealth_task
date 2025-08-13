import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AppService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  private readonly exchange: string = process.env.NODE_ENV ===
    process.env.TEST_ENV_NAME ?
    process.env.RABBITMQ_EXCHANGE_TEST || 'xray_exchange_test' :
    process.env.RABBITMQ_EXCHANGE || 'xray_exchange';

  private readonly routingKey: string = process.env.NODE_ENV ===
    process.env.TEST_ENV_NAME ?
    process.env.RABBITMQ_ROUTING_KEY_TEST || 'xray_data_test' :
    process.env.RABBITMQ_ROUTING_KEY || 'xray_data';

  private generateInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  async sendXrayData() {
    let data: [number, [number, number, number]][] = []
    const datalength = this.generateInt(1, 10);
    for (let i = 0; i < datalength; i++) {
      data.push([
        this.generateInt(729, 59771),
        [
          51.4,
          12.339,
          Math.random() * (4.335 - 0.046) + 0.046
        ]
      ]);
    }
    const sampleData = {
      '66bb584d4ae73e488c30a072': data,
      time: new Date().getSeconds(),
    };


    const check = await this.amqpConnection.publish(this.exchange, this.routingKey, JSON.stringify(sampleData));
    return check;
  }
}