import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Username already exists' }) // For conflict errors
  async register(@Body() body: AuthDto) {
    try {
      const user = await this.authService.register(
        body.username,
        body.password,
      );
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() body: AuthDto) {
    try {
      const user = await this.authService.validateUser(
        body.username,
        body.password,
      );
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
