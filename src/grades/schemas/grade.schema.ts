import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GradeDocument = Grade & Document;

@Schema({ timestamps: true })
export class Grade {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ required: true, default: 100 })
  maxScore: number;

  @Prop({ required: true, enum: ['Term 1', 'Term 2', 'Term 3', 'Final'] })
  term: string;

  @Prop({ required: true })
  academicYear: string;

  @Prop()
  teacherComment: string;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);