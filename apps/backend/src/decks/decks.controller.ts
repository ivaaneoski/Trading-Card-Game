import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DecksService } from './decks.service';
import { CreateDeckDto, UpdateDeckDto } from './decks.dto';

@Controller('decks')
export class DecksController {
  constructor(private decksService: DecksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateDeckDto, @Req() req: any) {
    try {
      return await this.decksService.createDeck(req.user.userId, dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyDecks(@Req() req: any) {
    return await this.decksService.getUserDecks(req.user.userId);
  }

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateDeck(@Body() dto: { deckId: string }, @Req() req: any) {
    return await this.decksService.validateDeck(dto.deckId, req.user.userId);
  }
}
