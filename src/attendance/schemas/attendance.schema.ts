import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ required: true, type: Date, default: () => new Date() })
  date: Date;

  @Prop({ required: true, enum: ['present', 'absent', 'late', 'excused'] })
  status: string;

  @Prop()
  teacherNotes: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);