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
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGatewayV2 implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const authHeader = client.handshake.headers.authorization;
    console.log('Raw auth header:', authHeader);

    if (!authHeader) return client.disconnect();

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) // Remove "Bearer " prefix
      : authHeader; // In case it's sent without "Bearer " prefix

    console.log('Extracted token:', token);
    console.log('Token length:', token.length);

    if (!token) return client.disconnect();

    try {
      const secret =
        this.configService.get<string>('JWT_SECRET') || 'fallback_secret_key';
      console.log('Using JWT secret:', secret);
      console.log('Token starts with:', token.substring(0, 20) + '...');

      // Use jwtService.verify without passing secret (it uses the one from module config)
      const payload = this.jwtService.verify(token);
      console.log('JWT payload:', payload);
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        console.log('User not found for ID:', payload.sub);
        throw new Error('User not found');
      }
      client.data.user = user;
      console.log('User authenticated successfully:', user.username);
    } catch (error) {
      console.log('JWT verification failed:', error.message);
      console.log('Error details:', error);
      if (error.name === 'JsonWebTokenError') {
        console.log('Invalid JWT format');
      } else if (error.name === 'TokenExpiredError') {
        console.log('JWT has expired');
      } else if (error.name === 'NotBeforeError') {
        console.log('JWT not active yet');
      }
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Optionally handle user disconnect logic
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() { roomId }, @ConnectedSocket() client: Socket) {
    console.log('roomId', roomId);
    client.join(roomId);
    const messages = await this.chatService.getRoomMessages(roomId);
    console.log('messages', messages);
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

  // Add a simple test method to verify JWT
  @SubscribeMessage('test')
  async testConnection(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    console.log('user', user);

    if (user) {
      client.emit('testResponse', {
        message: 'Connection successful!',
        user: { id: user.id, username: user.username },
      });
    } else {
      client.emit('testResponse', { message: 'No user found' });
    }
  }
}
