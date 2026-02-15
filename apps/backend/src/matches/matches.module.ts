import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameModule } from '../game/game.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [PrismaModule, GameModule, CardsModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
