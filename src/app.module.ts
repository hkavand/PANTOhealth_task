import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { XrayModule } from './xray/xray.module';

@Module({
  imports: [RabbitmqModule, XrayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
