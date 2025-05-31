import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { ChatGatewayV2 } from './chat.gateway.v2';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forFeature([Message])],
  controllers: [ChatController],
  providers: [ChatGatewayV2, ChatService],
})
export class ChatModule {}
