import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('materials')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaterialsController {
  constructor(private materialsService: MaterialsService) {}

  @Post()
  @Roles('teacher')
  async create(@Body() body: any, @Request() req) {
    return this.materialsService.create({ ...body, teacherId: req.user.userId });
  }

  @Get('my')
  @Roles('teacher')
  async getMyMaterials(@Request() req) {
    return this.materialsService.findAllByTeacher(req.user.userId);
  }

  @Get('class/:grade')
  async getByGrade(@Param('grade') grade: string, @Query('section') section?: string) {
    return this.materialsService.findAllByGrade(grade, section);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Delete(':id')
  @Roles('teacher')
  async remove(@Param('id') id: string, @Request() req) {
    return this.materialsService.remove(id, req.user.userId);
  }
}