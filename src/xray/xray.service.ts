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
    const newXray = new this.xrayModel({
      deviceId,
      time,
      dataLength,
    });
    return newXray.save();
  }

  async getAllXrays() {
    return this.xrayModel.find().exec();
  }

  async getXrayById(id: string) {
    return this.xrayModel.findById(id).exec();
  }

  async updateXray(id: string, updateXrayDto: { deviceId?: string; time?: number; dataLength?: number }) {
    return this.xrayModel.findByIdAndUpdate(id, updateXrayDto, { new: true }).exec();
  }

  async deleteXray(id: string) {
    return this.xrayModel.findByIdAndDelete(id).exec();
  }

  async filterXrays(deviceId?: string, time?: number) {
    const filter: any = {};
    if (deviceId) filter.deviceId = deviceId;
    if (time) filter.time = time;

    return this.xrayModel.find(filter).exec();
  }
}