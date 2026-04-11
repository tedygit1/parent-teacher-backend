import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('events')
  @Roles('admin', 'teacher')
  async createEvent(@Body() body: any, @Request() req) {
    return this.calendarService.create({ ...body, createdBy: req.user.userId });
  }

  @Get('events')
  async getEvents(@Request() req) {
    const { role, grade, classSection } = req.user;
    if (role === 'admin') {
      return this.calendarService.findAll();
    }
    return this.calendarService.findForUser(role, grade, classSection);
  }

  @Get('events/month')
  async getMonthEvents(@Query('year') year: number, @Query('month') month: number) {
    return this.calendarService.getMonthEvents(year, month);
  }

  @Get('events/:id')
  async getEvent(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Put('events/:id')
  @Roles('admin', 'teacher')
  async updateEvent(@Param('id') id: string, @Body() body: any) {
    return this.calendarService.update(id, body);
  }

  @Delete('events/:id')
  @Roles('admin', 'teacher')
  async deleteEvent(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
}