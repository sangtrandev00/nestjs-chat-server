import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(username: string, password: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username, password: hashed });
    return this.userRepo.save(user);
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepo.findOne({ where: { id } });
  }

  async validatePassword(
    username: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
// Chat app Postgres with Nestjs and angular!
// Order Microverice with Nestjs and Angular!
// Apply design pattern
