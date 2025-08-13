import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';
import { XrayModule } from '../xray/xray.module';

@Module({
  imports: [
    XrayModule,
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: process.env.NODE_ENV === process.env.TEST_ENV_NAME ?
            process.env.RABBITMQ_EXCHANGE_TEST || 'xray_exchange_test' :
            process.env.RABBITMQ_EXCHANGE || 'xray_exchange',
          type: 'direct',
        },
      ],
      uri: process.env.RABBITMQ_URL,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule { }
