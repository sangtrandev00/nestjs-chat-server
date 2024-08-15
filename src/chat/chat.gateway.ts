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
import { UserService } from '../user/user.service';

interface ChatMessage {
  roomId: string;
  message: string;
  userId: string;
}
// Chuyện gì sẽ xảy ra nếu như chúng ta dùng database để lưuu lại thông tin user và message
// Dùng firebase để lưu trữ được không ?
// Cố gắng làm và ứng dụng thử -> Để đa dạng nghiệp vụ
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private userService: UserService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Join Chat (Create User ?)
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    const user = this.userService.findById(userId);
    if (user) {
      client.data.user = user;
      return { status: 'success', message: `Joined as ${user.username}` };
    }
    return { status: 'error', message: 'User not found' };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    console.log('room Id', roomId);
    // Tạo một công kết nối chung cho 1 phòng ?
    // Ngoài ra còn các phương thức nào nữa ?
    client.join(roomId);
    return { status: 'success', message: `Joined room ${roomId}` };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.leave(roomId);
    return { status: 'success', message: `Left room ${roomId}` };
  }

  @SubscribeMessage('chatMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessage,
  ) {
    console.log('data', client.data);
    console.log('payload', payload);
    const user = client.data.user;
    if (user) {
      this.server.to(payload.roomId).emit('chatMessage', {
        userId: user.id,
        username: user.username,
        message: payload.message,
        roomId: payload.roomId,
      });
    }
  }

  @SubscribeMessage('sendNoti')
  handleSendNotify(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log('client', client.data);
    console.log('payload', payload);
    return { status: 'success', message: 'Send notify success' };
    // const user = client.data.user;
    // if (user) {
    //   this.server.to(payload.roomId).emit('sendNoti', {
    //     userId: user.id,
    //     username: user.username,
    //     message: payload.message,
    //     roomId: payload.roomId,
    //   });
    // }
  }

  @SubscribeMessage('sendNotiAllUser')
  handleSendNotifyAllUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    this.server.emit('notiAllUser', {
      message: 'Hello all user',
      payload: payload.message,
    });

    return { status: 'success', message: 'Send notify all success' };
    // const user = client.data.user;
    // if (user) {
    //   this.server.to(payload.roomId).emit('sendNoti', {
    //     userId: user.id,
    //     username: user.username,
    //     message: payload.message,
    //     roomId: payload.roomId,
    //   });
    // }
  }
}
