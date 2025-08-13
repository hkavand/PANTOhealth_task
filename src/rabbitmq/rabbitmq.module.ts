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
          name: process.env.RABBITMQ_EXCHANGE || 'xray_exchange',
          type: 'direct',
        },
      ],
      uri: process.env.RABBITMQ_URL,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [RabbitmqService],  // Services that will handle message logic
  exports: [RabbitmqService],    // Export service so other modules can use it if needed
})
export class RabbitmqModule { }
