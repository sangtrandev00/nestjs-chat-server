import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms/:roomId/messages')
  async getRoomMessages(@Param('roomId') roomId: string) {
    return this.chatService.getRoomMessages(roomId);
  }

  @Get('test-auth')
  @UseGuards(AuthGuard('jwt'))
  testAuth(@Request() req) {
    return {
      message: 'JWT verification successful!',
      user: req.user,
    };
  }
}
