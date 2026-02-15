import { Module } from '@nestjs/common';
import { GameEngine } from './game.engine';
import { PrismaModule } from '../prisma/prisma.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [PrismaModule, CardsModule],
  providers: [GameEngine],
  exports: [GameEngine],
})
export class GameModule {}
