import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.userService.create(username, password);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { id: user.id, username: user.username };
  }
}
