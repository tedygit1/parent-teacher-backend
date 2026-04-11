import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';

@Injectable()
export class AnnouncementsService {
  constructor(@InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>) {}

  async create(createDto: any): Promise<AnnouncementDocument> {
    const announcement = new this.announcementModel(createDto);
    return announcement.save();
  }

  async findAll(filter?: any): Promise<AnnouncementDocument[]> {
    const query = filter || { isActive: true };
    return this.announcementModel
      .find(query)
      .populate('teacherId', 'firstName lastName')
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
  }

  async findForUser(userRole: string, userGrade?: string, userSection?: string): Promise<AnnouncementDocument[]> {
    const audienceConditions = ['all', userRole];
    if (userGrade) audienceConditions.push(userGrade);
    if (userGrade && userSection) audienceConditions.push(`${userGrade}-${userSection}`);

    return this.announcementModel
      .find({
        audience: { $in: audienceConditions },
        isActive: true,
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gte: new Date() } },
        ],
      })
      .populate('teacherId', 'firstName lastName')
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<AnnouncementDocument> {
    const announcement = await this.announcementModel.findById(id).exec();
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  async update(id: string, updateData: any): Promise<AnnouncementDocument | null> {
    return this.announcementModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.announcementModel.findByIdAndDelete(id).exec();
  }

  async togglePin(id: string): Promise<AnnouncementDocument | null> {
    const announcement = await this.findOne(id);
    return this.announcementModel.findByIdAndUpdate(id, { pinned: !announcement.pinned }, { new: true }).exec();
  }
}