import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  providers: [MessagingGateway, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}