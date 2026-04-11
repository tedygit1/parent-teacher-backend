import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private gradesService: GradesService) {}

  @Post()
  @Roles('teacher')
  async create(@Body() body: any, @Request() req) {
    return this.gradesService.create({ ...body, teacherId: req.user.userId });
  }

  @Get('student/:studentId')
  async getByStudent(@Param('studentId') studentId: string) {
    const grades = await this.gradesService.findAllByStudent(studentId);
    const average = await this.gradesService.getAverageByStudent(studentId);
    return { grades, average };
  }

  @Get('my')
  @Roles('teacher')
  async getMyGrades(@Request() req) {
    return this.gradesService.findAllByTeacher(req.user.userId);
  }

  @Put(':id')
  @Roles('teacher')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.gradesService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id') id: string, @Request() req) {
    return this.gradesService.remove(id, req.user.userId);
  }
}