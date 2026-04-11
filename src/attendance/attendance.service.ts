import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';

@Injectable()
export class AttendanceService {
  constructor(@InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>) {}

  async create(createDto: any): Promise<AttendanceDocument> {
    const attendance = new this.attendanceModel(createDto);
    return attendance.save();
  }

  async findAllByStudent(studentId: string): Promise<AttendanceDocument[]> {
    return this.attendanceModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .sort({ date: -1 })
      .exec();
  }

  async findAllByTeacher(teacherId: string): Promise<AttendanceDocument[]> {
    return this.attendanceModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('studentId', 'firstName lastName grade classSection')
      .sort({ date: -1 })
      .exec();
  }

  async findByDate(studentId: string, date: Date): Promise<AttendanceDocument | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
  }

  async findTodayByTeacher(teacherId: string): Promise<AttendanceDocument[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.attendanceModel
      .find({
        teacherId: new Types.ObjectId(teacherId),
        date: { $gte: today, $lt: tomorrow },
      })
      .populate('studentId', 'firstName lastName')
      .exec();
  }

  async update(id: string, updateData: any, teacherId: string): Promise<AttendanceDocument | null> {
    const attendance = await this.attendanceModel.findById(id).exec();
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    if (attendance.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only update your own attendance records');
    }
    return this.attendanceModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async getAttendanceRate(studentId: string): Promise<number> {
    const records = await this.findAllByStudent(studentId);
    if (records.length === 0) return 100;
    const presentCount = records.filter(r => r.status === 'present').length;
    return (presentCount / records.length) * 100;
  }
}