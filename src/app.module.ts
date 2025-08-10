import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { XrayModule } from './xray/xray.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    RabbitmqModule,
    XrayModule,
    MongooseModule.forRoot('mongodb://localhost:27017/xraydb')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
