import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':username')
  async getProfile(@Param('username') username: string) {
    return await this.usersService.getProfile(username);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listTop() {
    return await this.usersService.getLeaderboard(50);
  }
}
