import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from '../../chat/entity/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  password: string; // hashed

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
