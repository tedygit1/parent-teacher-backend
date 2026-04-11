import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(userData: { email: string; password: string; role: string; name: string; phone?: string }): Promise<UserDocument> {
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    
    return newUser.save();
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(user, updateData);
    return user.save();
  }

  async getAllUsers(role?: string): Promise<UserDocument[]> {
    const filter = role ? { role } : {};
    return this.userModel.find(filter).select('-password').exec();
  }
}