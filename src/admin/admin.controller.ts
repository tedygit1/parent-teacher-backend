import { Controller, Get, Delete, Param, UseGuards, Body, Post, Put } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Announcement, AnnouncementDocument } from '../announcements/schemas/announcement.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Announcement.name) private announcementModel: Model<AnnouncementDocument>,
  ) {}

  @Get('users')
  async getAllUsers() {
    const users = await this.userModel.find().select('-password').exec();
    return { success: true, count: users.length, data: users };
  }

  @Get('users/role/:role')
  async getUsersByRole(@Param('role') role: string) {
    const users = await this.userModel.find({ role }).select('-password').exec();
    return { success: true, count: users.length, data: users };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, message: 'User deleted successfully' };
  }

  @Put('users/:id/activate')
  async toggleUserActivation(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    const user = await this.userModel.findByIdAndUpdate(id, { isActive: body.isActive }, { new: true }).select('-password').exec();
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, data: user };
  }

  @Post('announcements')
  async createAnnouncement(@Body() body: { title: string; content: string; priority: string; category: string; pinned?: boolean; expiryDate?: Date }) {
    const announcement = new this.announcementModel({ ...body, adminId: 'admin' });
    await announcement.save();
    return { success: true, data: announcement };
  }

  @Delete('announcements/:id')
  async deleteAnnouncement(@Param('id') id: string) {
    const announcement = await this.announcementModel.findByIdAndDelete(id).exec();
    if (!announcement) return { success: false, message: 'Announcement not found' };
    return { success: true, message: 'Announcement deleted successfully' };
  }

  @Put('announcements/:id/pin')
  async togglePinAnnouncement(@Param('id') id: string, @Body() body: { pinned: boolean }) {
    const announcement = await this.announcementModel.findByIdAndUpdate(id, { pinned: body.pinned }, { new: true }).exec();
    if (!announcement) return { success: false, message: 'Announcement not found' };
    return { success: true, data: announcement };
  }

  @Get('stats')
  async getSystemStats() {
    const totalUsers = await this.userModel.countDocuments();
    const teachers = await this.userModel.countDocuments({ role: 'teacher' });
    const parents = await this.userModel.countDocuments({ role: 'parent' });
    const students = await this.userModel.countDocuments({ role: 'student' });
    const admins = await this.userModel.countDocuments({ role: 'admin' });
    const totalAnnouncements = await this.announcementModel.countDocuments();
    return { success: true, data: { totalUsers, teachers, parents, students, admins, totalAnnouncements } };
  }
}