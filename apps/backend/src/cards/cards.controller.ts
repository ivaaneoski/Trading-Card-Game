import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CardsService } from './cards.service';
import { CreateCardDto } from './cards.dto';

@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateCardDto, @Req() req: any) {
    try {
      return await this.cardsService.createCard(req.user.userId, dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyCards(@Req() req: any) {
    return await this.cardsService.getUserCards(req.user.userId);
  }

  @Get()
  async listPublic() {
    return await this.cardsService.getPublicCards();
  }
}
