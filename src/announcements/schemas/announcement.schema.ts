import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: string;

  @Prop({ enum: ['event', 'exam', 'holiday', 'meeting', 'general'], default: 'general' })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  teacherId: Types.ObjectId;

  @Prop({ type: String, default: null })
  adminId: string;

  @Prop({ type: [String], default: ['all'] })
  audience: string[]; // ['all', 'parents', 'teachers', 'students', 'grade5', 'grade10-sectionA']

  @Prop({ default: false })
  pinned: boolean;

  @Prop()
  expiryDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);