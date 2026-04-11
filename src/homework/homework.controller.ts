import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}

  @Post()
  @Roles('teacher')
  async create(@Body() body: any, @Request() req) {
    return this.homeworkService.create({ ...body, teacherId: req.user.userId });
  }

  @Get('my')
  @Roles('teacher')
  async getMyHomework(@Request() req) {
    return this.homeworkService.findAllByTeacher(req.user.userId);
  }

  @Get('class/:grade')
  async getByGrade(@Param('grade') grade: string, @Query('section') section?: string) {
    return this.homeworkService.findAllByGrade(grade, section);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.homeworkService.findOne(id);
  }

  @Put(':id')
  @Roles('teacher')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.homeworkService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id') id: string, @Request() req) {
    return this.homeworkService.remove(id, req.user.userId);
  }

  @Post(':id/submit')
  @Roles('student')
  async submit(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.homeworkService.submit({
      homeworkId: id,
      studentId: req.user.userId,
      ...body,
    });
  }

  @Get(':id/submissions')
  @Roles('teacher')
  async getSubmissions(@Param('id') id: string) {
    return this.homeworkService.getSubmissionsByHomework(id);
  }

  @Get(':id/my-submission')
  @Roles('student')
  async getMySubmission(@Param('id') id: string, @Request() req) {
    return this.homeworkService.getSubmissionByStudent(id, req.user.userId);
  }

  @Put('submission/:submissionId/grade')
  @Roles('teacher')
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() body: { grade: number; feedback: string },
    @Request() req,
  ) {
    return this.homeworkService.gradeSubmission(submissionId, body.grade, body.feedback, req.user.userId);
  }
}