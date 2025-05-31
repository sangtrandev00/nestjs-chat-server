import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('room/:roomId')
  async getRoomMessages(@Param('roomId') roomId: string) {
    return this.chatService.getRoomMessages(roomId);
  }
}
