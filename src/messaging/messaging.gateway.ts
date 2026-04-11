import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'chat',
})
@Injectable()
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(private messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    this.connectedUsers.set(data.userId, client.id);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
    client.broadcast.emit('userOnline', { userId: data.userId, status: true });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
  ) {
    const message = await this.messagingService.create({
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
    });

    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', {
        id: (message._id as any).toString(),
        senderId: data.senderId,
        content: data.content,
        createdAt: message.createdAt,
      });
    }

    client.emit('messageSent', { success: true, messageId: (message._id as any).toString() });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { senderId: string; receiverId: string; isTyping: boolean },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: data.senderId,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; senderId: string; receiverId: string },
  ) {
    await this.messagingService.markAsRead(data.messageId);
    
    const senderSocketId = this.connectedUsers.get(data.senderId);
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('messageRead', {
        messageId: data.messageId,
        userId: data.receiverId,
      });
    }
  }

  @SubscribeMessage('getConversations')
  async handleGetConversations(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const conversations = await this.messagingService.getConversations(data.userId);
    client.emit('conversationsList', conversations);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; otherUserId: string },
  ) {
    const messages = await this.messagingService.getConversation(data.userId, data.otherUserId);
    client.emit('messagesHistory', messages);
    await this.messagingService.markConversationAsRead(data.userId, data.otherUserId);
  }
}