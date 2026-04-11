import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';

@Injectable()
export class MaterialsService {
  constructor(@InjectModel(Material.name) private materialModel: Model<MaterialDocument>) {}

  async create(createDto: any): Promise<MaterialDocument> {
    const material = new this.materialModel(createDto);
    return material.save();
  }

  async findAllByTeacher(teacherId: string): Promise<MaterialDocument[]> {
    return this.materialModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllByGrade(grade: string, section?: string): Promise<MaterialDocument[]> {
    const filter: any = { grade };
    if (section) filter.classSection = section;
    return this.materialModel
      .find(filter)
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<MaterialDocument> {
    const material = await this.materialModel.findById(id).exec();
    if (!material) {
      throw new NotFoundException('Material not found');
    }
    return material;
  }

  async remove(id: string, teacherId: string): Promise<void> {
    const material = await this.findOne(id);
    if (material.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('You can only delete your own materials');
    }
    await this.materialModel.findByIdAndDelete(id).exec();
  }
}