import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entity/message.entity';
import { User } from '../user/entity/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async createMessage(roomId: string, content: string, user: User) {
    const message = this.messageRepo.create({ roomId, content, user });
    return this.messageRepo.save(message);
  }

  async getRoomMessages(roomId: string) {
    return this.messageRepo.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
    });
  }
}
