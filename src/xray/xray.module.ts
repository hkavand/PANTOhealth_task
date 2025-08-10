import { Module } from '@nestjs/common';
import { XrayService } from './xray.service';
import { MongooseModule } from '@nestjs/mongoose';
import { XraySchema } from './xray.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Xray', schema: XraySchema }])],
  providers: [XrayService],
  exports: [XrayService],
})
export class XrayModule {}
