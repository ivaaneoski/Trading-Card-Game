import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getMatchHistory(@Req() req: any) {
    return await this.matchesService.getMatchHistory(req.user.userId, 50);
  }

  @Post('forfeit')
  @UseGuards(AuthGuard('jwt'))
  async forfeit(@Body() body: { matchId: string }, @Req() req: any) {
    return await this.matchesService.forfeitMatch(body.matchId, req.user.userId);
  }
}
