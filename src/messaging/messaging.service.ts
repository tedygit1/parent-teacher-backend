import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagingService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async create(messageData: any): Promise<MessageDocument> {
    const message = new this.messageModel(messageData);
    return message.save();
  }

  async getConversation(userId1: string, userId2: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: new Types.ObjectId(userId1), receiverId: new Types.ObjectId(userId2) },
          { senderId: new Types.ObjectId(userId2), receiverId: new Types.ObjectId(userId1) },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messageModel.findByIdAndUpdate(messageId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        senderId: new Types.ObjectId(otherUserId),
        receiverId: new Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { receiverId: new Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', new Types.ObjectId(userId)] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ],
            },
          },
        },
      },
      { $sort: { lastMessageTime: -1 } },
    ]);

    return conversations;
  }
}