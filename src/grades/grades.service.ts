import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Grade, GradeDocument } from './schemas/grade.schema';

@Injectable()
export class GradesService {
  constructor(@InjectModel(Grade.name) private gradeModel: Model<GradeDocument>) {}

  async create(createGradeDto: any): Promise<GradeDocument> {
    const grade = new this.gradeModel(createGradeDto);
    return grade.save();
  }

  async findAllByStudent(studentId: string): Promise<GradeDocument[]> {
    return this.gradeModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllByTeacher(teacherId: string): Promise<GradeDocument[]> {
    return this.gradeModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('studentId', 'firstName lastName grade classSection')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<GradeDocument> {
    const grade = await this.gradeModel.findById(id).exec();
    if (!grade) {
      throw new NotFoundException('Grade not found');
    }
    return grade;
  }

  async update(id: string, updateData: any, teacherId: string): Promise<GradeDocument | null> {
    const grade = await this.findOne(id);
    if (grade.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only update your own grades');
    }
    return this.gradeModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const grade = await this.findOne(id);
    if (grade.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete your own grades');
    }
    await this.gradeModel.findByIdAndDelete(id).exec();
  }

  async getAverageByStudent(studentId: string): Promise<number> {
    const grades = await this.findAllByStudent(studentId);
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + grade.score, 0);
    return total / grades.length;
  }
}