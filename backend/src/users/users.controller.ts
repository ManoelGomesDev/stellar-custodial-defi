import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { LoginDto } from '../auth/login.dto'; // se quiser, mas usamos no auth
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user.id,
      email: user.email,
      stellarPublicKey: user.stellarPublicKey,
      message: 'Conta criada! Sua wallet Stellar foi gerada automaticamente 🎉',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: user?.id,
      email: user?.email,
      stellarPublicKey: user?.stellarPublicKey,
    };
  }
}