import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray, XrayDocument } from './xray.schema';

@Injectable()
export class XrayService {
  constructor(
    @InjectModel(Xray.name) private readonly xrayModel: Model<XrayDocument>,
  ) {}

  async saveXrayData(deviceId: string, time: number, dataLength: number) {
    // TODO: Implement data processing logic
    // to extract required parameters from x-ray data
    
    const newXray = new this.xrayModel({
      deviceId,
      time,
      dataLength,
    });
    return newXray.save();
  }
}
