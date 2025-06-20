import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.validatePassword(username, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    console.log(payload);
    const token = this.jwtService.sign(payload);
    console.log(token);
    return {
      access_token: token,
    };
  }

  async register(username: string, password: string) {
    const user = await this.userService.create(username, password);
    return this.login(user);
  }
}
