import { Injectable, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    try {
      const adminUserId = 'admin123';
      const existingAdmin = await this.userModel.findOne({ userId: adminUserId }).exec();
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new this.userModel({
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@school.com',
          phone: '+251900000000',
          address: 'School Admin Office',
          userId: 'admin123',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
        });
        await admin.save();
        this.logger.log('✅ Default admin created: admin123 / admin123');
      } else {
        this.logger.log('✅ Admin already exists, skipping creation');
      }
    } catch (error) {
      // If duplicate key error, admin already exists
      if (error.code === 11000) {
        this.logger.log('✅ Admin already exists (duplicate key), skipping creation');
      } else {
        this.logger.error('Error creating admin:', error.message);
      }
    }
  }

  async login(userId: string, password: string, role: string) {
    const user = await this.userModel.findOne({ userId, role }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      userId: user.userId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userId: user.userId,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
      },
    };
  }

  async register(userData: any) {
    const existingUser = await this.userModel.findOne({ userId: userData.userId }).exec();
    if (existingUser) {
      throw new UnauthorizedException('User ID already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });
    await newUser.save();

    return this.login(newUser.userId, userData.password, newUser.role);
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: any) {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password').exec();
    return user;
  }
}