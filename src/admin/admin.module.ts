import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Announcement, AnnouncementSchema } from '../announcements/schemas/announcement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AdminController],
})
export class AdminModule {}