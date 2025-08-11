import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class AppService {
  constructor(private readonly amqpConnection: AmqpConnection) { }

  private generateInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  sendXrayData() {
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

    this.amqpConnection.publish('xray_exchange', 'xray_data', JSON.stringify(sampleData));
    console.log('Sent x-ray data:', sampleData);
  }
}