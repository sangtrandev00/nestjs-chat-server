import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  username: string;
}

@Injectable()
export class UserService {
  private users: User[] = [];

  create(username: string): User {
    const user: User = {
      id: Date.now().toString(),
      username,
    };
    this.users.push(user);
    return user;
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  findByUsername(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }
}
// Chat app Postgres with Nestjs and angular!
// Order Microverice with Nestjs and Angular!
// Apply design pattern
