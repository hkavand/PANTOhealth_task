import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'xray_exchange',
          type: 'direct',         
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672',  
      connectionInitOptions: { wait: false },   
    }),
  ],
  providers: [RabbitmqService],  // Services that will handle message logic
  exports: [RabbitmqService],    // Export service so other modules can use it if needed
})
export class RabbitmqModule { }
