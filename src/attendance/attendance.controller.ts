import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @Roles('teacher')
  async create(@Body() body: any, @Request() req) {
    return this.attendanceService.create({ ...body, teacherId: req.user.userId });
  }

  @Get('student/:studentId')
  async getByStudent(@Param('studentId') studentId: string) {
    const records = await this.attendanceService.findAllByStudent(studentId);
    const rate = await this.attendanceService.getAttendanceRate(studentId);
    return { records, rate };
  }

  @Get('my')
  @Roles('teacher')
  async getMyAttendance(@Request() req) {
    return this.attendanceService.findAllByTeacher(req.user.userId);
  }

  @Get('today')
  @Roles('teacher')
  async getTodayAttendance(@Request() req) {
    return this.attendanceService.findTodayByTeacher(req.user.userId);
  }

  @Get('check')
  async checkDate(@Query('studentId') studentId: string, @Query('date') date: string) {
    const attendance = await this.attendanceService.findByDate(studentId, new Date(date));
    return { exists: !!attendance, attendance };
  }

  @Put(':id')
  @Roles('teacher')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.attendanceService.update(id, body, req.user.userId);
  }
}