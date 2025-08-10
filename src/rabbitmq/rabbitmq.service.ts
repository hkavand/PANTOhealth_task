import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);

  @RabbitSubscribe({
    exchange: 'xray_exchange',
    routingKey: 'xray_data',
    queue: 'xray_queue',
  })
  public async handleXrayData(message: any) {
    this.logger.log('hah ha haaa');
    // Here you can add your processing logic for the x-ray data
  }
}
