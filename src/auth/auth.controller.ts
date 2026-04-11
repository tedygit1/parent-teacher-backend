import { Controller, Post, Body, Get, Put, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/parent')
  async registerParent(@Body() body: any) {
    return this.authService.register({ ...body, role: 'parent' });
  }

  @Post('register/teacher')
  async registerTeacher(@Body() body: any) {
    return this.authService.register({ ...body, role: 'teacher' });
  }

  @Post('register/student')
  async registerStudent(@Body() body: any) {
    return this.authService.register({ ...body, role: 'student' });
  }

  @Post('login')
  async login(@Body() body: { userId: string; password: string; role: string }) {
    return this.authService.login(body.userId, body.password, body.role);
  }

  @Post('admin/login')
  async adminLogin(@Body() body: { userId: string; password: string }) {
    const result = await this.authService.login(body.userId, body.password, 'admin');
    if (result.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.userId, updateData);
  }
}