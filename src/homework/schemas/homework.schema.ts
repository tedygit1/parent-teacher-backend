import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HomeworkDocument = Homework & Document;

@Schema({ timestamps: true })
export class Homework {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
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
  dueDate: Date;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: 'active', enum: ['active', 'past', 'archived'] })
  status: string;
}

export const HomeworkSchema = SchemaFactory.createForClass(Homework);