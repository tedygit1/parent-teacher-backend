import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true })
export class Material {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  grade: string;

  @Prop()
  classSection: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop()
  fileType: string;

  @Prop()
  fileName: string;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);