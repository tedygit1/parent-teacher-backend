import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Homework, HomeworkDocument } from './schemas/homework.schema';
import { Submission, SubmissionDocument } from './schemas/submission.schema';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectModel(Homework.name) private homeworkModel: Model<HomeworkDocument>,
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
  ) {}

  async create(createDto: any): Promise<HomeworkDocument> {
    const homework = new this.homeworkModel(createDto);
    return homework.save();
  }

  async findAllByTeacher(teacherId: string): Promise<HomeworkDocument[]> {
    return this.homeworkModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .sort({ dueDate: 1 })
      .exec();
  }

  async findAllByGrade(grade: string, section?: string): Promise<HomeworkDocument[]> {
    const filter: any = { grade };
    if (section) filter.classSection = section;
    return this.homeworkModel
      .find(filter)
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<HomeworkDocument> {
    const homework = await this.homeworkModel.findById(id).populate('teacherId', 'firstName lastName').exec();
    if (!homework) {
      throw new NotFoundException('Homework not found');
    }
    return homework;
  }

  async update(id: string, updateData: any, teacherId: string): Promise<HomeworkDocument | null> {
    const homework = await this.findOne(id);
    if (homework.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only update your own homework');
    }
    return this.homeworkModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const homework = await this.findOne(id);
    if (homework.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete your own homework');
    }
    await this.homeworkModel.findByIdAndDelete(id).exec();
  }

  async submit(submissionDto: any): Promise<SubmissionDocument> {
    const existing = await this.submissionModel.findOne({
      homeworkId: submissionDto.homeworkId,
      studentId: submissionDto.studentId,
    });
    if (existing) {
      const updated = await this.submissionModel.findByIdAndUpdate(existing._id, submissionDto, { new: true }).exec();
      return updated as SubmissionDocument;
    }
    const submission = new this.submissionModel(submissionDto);
    return submission.save();
  }

  async getSubmissionsByHomework(homeworkId: string): Promise<SubmissionDocument[]> {
    return this.submissionModel
      .find({ homeworkId: new Types.ObjectId(homeworkId) })
      .populate('studentId', 'firstName lastName')
      .exec();
  }

  async getSubmissionByStudent(homeworkId: string, studentId: string): Promise<SubmissionDocument | null> {
    return this.submissionModel
      .findOne({
        homeworkId: new Types.ObjectId(homeworkId),
        studentId: new Types.ObjectId(studentId),
      })
      .exec();
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string, teacherId: string): Promise<SubmissionDocument | null> {
    const submission = await this.submissionModel.findById(submissionId).populate('homeworkId').exec();
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    const homework = await this.findOne(submission.homeworkId.toString());
    if (homework.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only grade submissions for your homework');
    }
    return this.submissionModel.findByIdAndUpdate(
      submissionId,
      { grade, feedback, status: 'graded' },
      { new: true },
    ).exec();
  }
}