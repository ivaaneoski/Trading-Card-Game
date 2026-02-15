import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameEngine } from '../game/game.engine';
import { CardsService } from '../cards/cards.service';

@Injectable()
export class MatchesService {
  private logger = new Logger('MatchesService');

  constructor(
    private prisma: PrismaService,
    private gameEngine: GameEngine,
    private cardsService: CardsService,
  ) {}

  async createMatch(player1Id: string, deck1Id: string, player2Id: string, deck2Id: string) {
    const match = await this.prisma.match.create({
      data: {
        player1Id,
        player2Id,
        deck1Id,
        status: 'active',
        startedAt: new Date(),
        roomId: `room-${Date.now()}-${Math.random()}`,
      },
    });

    // Initialize game state (store in Redis for performance)
    const deck1Cards = await this.getDeckCards(deck1Id);
    const deck2Cards = await this.getDeckCards(deck2Id);
    const gameState = await this.gameEngine.initializeGame(match.id, player1Id, deck1Cards, player2Id, deck2Cards);

    // Store game state in Redis (implementation depends on Redis client)
    this.logger.log(`Match ${match.id} created between ${player1Id} and ${player2Id}`);

    return match;
  }

  async getMatchHistory(userId: string, limit: number = 50) {
    return await this.prisma.match.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async endMatch(matchId: string, winnerId: string, eloChange: { [key: string]: number }) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });

    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'completed',
        winner: winnerId,
        result: winnerId === match!.player1Id ? 'win' : 'loss',
        eloChange1: eloChange[match!.player1Id] || 0,
        eloChange2: eloChange[match!.player2Id] || 0,
        endedAt: new Date(),
      },
    });

    // Update player stats and ELO
    const players = [match!.player1Id, match!.player2Id];
    for (const playerId of players) {
      const isWinner = playerId === winnerId;
      const eloDelta = eloChange[playerId] || 0;

      await this.prisma.user.update({
        where: { id: playerId },
        data: {
          elo: { increment: eloDelta },
          wins: isWinner ? { increment: 1 } : undefined,
          losses: !isWinner ? { increment: 1 } : undefined,
          totalGames: { increment: 1 },
        },
      });

      await this.prisma.eloHistory.create({
        data: {
          userId: playerId,
          elo: (await this.prisma.user.findUnique({ where: { id: playerId } }))!.elo,
          change: eloDelta,
          reason: isWinner ? 'match_win' : 'match_loss',
        },
      });
    }

    this.logger.log(`Match ${matchId} ended. Winner: ${winnerId}`);
  }

  async forfeitMatch(matchId: string, playerId: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');

    const opponent = match.player1Id === playerId ? match.player2Id : match.player1Id;
    const eloChange = this.calculateEloChange(true, false); // winner, loser

    await this.endMatch(matchId, opponent, {
      [opponent]: eloChange.winner,
      [playerId]: eloChange.loser,
    });

    return { forfeited: true, opponent };
  }

  private async getDeckCards(deckId: string) {
    const deck = await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: { cards: true },
    });
    if (!deck) throw new Error('Deck not found');

    // Flatten cards with multiplicity
    const cards: string[] = [];
    for (const dc of deck.cards) {
      for (let i = 0; i < dc.quantity; i++) {
        cards.push(dc.cardId);
      }
    }
    return cards;
  }

  private calculateEloChange(isWinner: boolean, isDraw: boolean = false): { winner: number; loser: number } {
    const K = 32; // Elo constant
    if (isDraw) return { winner: 0, loser: 0 };
    return isWinner ? { winner: K, loser: -K } : { winner: -K, loser: K };
  }
}
