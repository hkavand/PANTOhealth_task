import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type XrayDocument = Xray & Document;

@Schema()
export class Xray {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  time: number;

  @Prop()
  dataLength: number;

//   @Prop()
//   dataVolume: number;

  // You can add other relevant fields here
}

export const XraySchema = SchemaFactory.createForClass(Xray);
