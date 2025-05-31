import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGatewayV2 implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return client.disconnect();
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findById(payload.sub);
      if (!user) throw new Error();
      client.data.user = user;
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Optionally handle user disconnect logic
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() { roomId }, @ConnectedSocket() client: Socket) {
    client.join(roomId);
    const messages = await this.chatService.getRoomMessages(roomId);
    client.emit('roomHistory', messages);
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() { roomId, content },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) throw new WsException('Unauthorized');
    const message = await this.chatService.createMessage(roomId, content, user);
    this.server.to(roomId).emit('newMessage', {
      id: message.id,
      username: user.username,
      content: message.content,
      createdAt: message.createdAt,
    });
  }
}
