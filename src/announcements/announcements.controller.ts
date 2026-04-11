import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Post()
  @Roles('admin', 'teacher')
  async create(@Body() body: any, @Request() req) {
    const createData = { ...body };
    if (req.user.role === 'teacher') {
      createData.teacherId = req.user.userId;
    } else {
      createData.adminId = req.user.userId;
    }
    return this.announcementsService.create(createData);
  }

  @Get()
  async getAll(@Request() req) {
    if (req.user.role === 'admin') {
      return this.announcementsService.findAll();
    }
    return this.announcementsService.findForUser(req.user.role, req.user.grade, req.user.classSection);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Put(':id')
  @Roles('admin', 'teacher')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.announcementsService.update(id, body);
  }

  @Delete(':id')
  @Roles('admin', 'teacher')
  async remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }

  @Put(':id/pin')
  @Roles('admin', 'teacher')
  async togglePin(@Param('id') id: string) {
    return this.announcementsService.togglePin(id);
  }
}