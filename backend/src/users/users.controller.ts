// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')                    // POST /users/signup
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    // Nunca devolvemos a secret key!
    return {
      id: user.id,
      email: user.email,
      stellarPublicKey: user.stellarPublicKey,
      message: 'Conta criada! Sua wallet Stellar foi gerada automaticamente 🎉',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: { user: { userId: number; email: string } }) {
    const user = await this.usersService.findById(Number(req.user.userId));
    return {
      id: user?.id,
      email: user?.email,
      stellarPublicKey: user?.stellarPublicKey,
    };
  }
}