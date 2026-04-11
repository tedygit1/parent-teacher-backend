import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalendarEvent, EventDocument } from './schemas/event.schema';

@Injectable()
export class CalendarService {
  constructor(@InjectModel(CalendarEvent.name) private eventModel: Model<EventDocument>) {}

  async create(createDto: any): Promise<EventDocument> {
    const event = new this.eventModel(createDto);
    return event.save();
  }

  async findAll(filter?: any): Promise<EventDocument[]> {
    const query = filter || {};
    return this.eventModel
      .find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 })
      .exec();
  }

  async findForUser(userRole: string, userGrade?: string, userSection?: string): Promise<EventDocument[]> {
    const audienceConditions = ['all', userRole];
    if (userGrade) audienceConditions.push(userGrade);
    if (userGrade && userSection) audienceConditions.push(`${userGrade}-${userSection}`);

    return this.eventModel
      .find({
        audience: { $in: audienceConditions },
        isActive: true,
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, updateData: any): Promise<EventDocument | null> {
    return this.eventModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.eventModel.findByIdAndDelete(id).exec();
  }

  async getMonthEvents(year: number, month: number): Promise<EventDocument[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.eventModel
      .find({
        startDate: { $gte: startDate, $lte: endDate },
        isActive: true,
      })
      .sort({ startDate: 1 })
      .exec();
  }
}