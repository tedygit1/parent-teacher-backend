import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // Common fields for all roles
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  userId: string;  // Unique login ID (e.g., parent123, teacher123)

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'teacher', 'parent', 'student'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  // Parent specific fields
  @Prop()
  numberOfChildren?: number;

  @Prop({ enum: ['Parent', 'Guardian', 'Grandparent', 'Other'] })
  relationship?: string;

  @Prop()
  occupation?: string;

  // Teacher specific fields
  @Prop()
  teacherId?: string;

  @Prop()
  primarySubject?: string;

  @Prop()
  qualification?: string;

  @Prop()
  yearsOfExperience?: number;

  @Prop()
  department?: string;

  // Student specific fields
  @Prop()
  studentId?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  grade?: string;  // Grade/Year e.g., Grade 10

  @Prop()
  classSection?: string;  // Class/Section

  @Prop()
  parentEmail?: string;  // Parent's email

  @Prop()
  parentPhone?: string;  // Parent's phone
}

export const UserSchema = SchemaFactory.createForClass(User);