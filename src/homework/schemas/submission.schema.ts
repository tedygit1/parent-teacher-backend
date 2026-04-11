import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Submission {
  @Prop({ type: Types.ObjectId, ref: 'Homework', required: true })
  homeworkId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop()
  submissionText: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop()
  grade: number;

  @Prop()
  feedback: string;

  @Prop({ default: 'submitted', enum: ['submitted', 'graded', 'late'] })
  status: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);