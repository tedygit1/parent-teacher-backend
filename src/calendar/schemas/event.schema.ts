import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = CalendarEvent & Document;

@Schema({ timestamps: true })
export class CalendarEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['event', 'exam', 'holiday', 'meeting'] })
  type: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  location: string;

  @Prop({ type: [String], default: ['all'] })
  audience: string[]; // ['all', 'teachers', 'parents', 'students', 'grade5', 'grade10-sectionA']

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);