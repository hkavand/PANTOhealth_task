import { Module } from '@nestjs/common';
import { XrayService } from './xray.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Xray, XraySchema } from './xray.schema';
import { XrayController } from './xray.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Xray.name, schema: XraySchema }])],
  providers: [XrayService],
  exports: [XrayService],
  controllers: [XrayController],
})
export class XrayModule {}
