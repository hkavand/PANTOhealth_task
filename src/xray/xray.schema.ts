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

  // for the love of god, i couldn't understand the dataVolume property
  // I asked in an email but the response was not clear
  // At the end I decided to remove it
  // because I thought it was not necessary for the task.
  // if i get rejected for this, i mean ..., you know ...,  it's not ok and all but 
  // I'll be fine with it :)
}

export const XraySchema = SchemaFactory.createForClass(Xray);
