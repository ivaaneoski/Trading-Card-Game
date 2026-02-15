import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeckDto } from './decks.dto';
import * as crypto from 'crypto';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  async createDeck(userId: string, dto: CreateDeckDto) {
    const MAX_DECK_SIZE = 30;
    const totalCards = dto.cards.reduce((sum, c) => sum + c.quantity, 0);
    if (totalCards > MAX_DECK_SIZE) throw new Error(`Deck size exceeds ${MAX_DECK_SIZE}`);

    // Verify all cards belong to user
    for (const dc of dto.cards) {
      const card = await this.prisma.card.findUnique({
        where: { id: dc.cardId },
        select: { ownerId: true },
      });
      if (!card || card.ownerId !== userId) throw new Error('Invalid card');
    }

    const checksum = this.generateDeckChecksum(dto.cards);

    const deck = await this.prisma.deck.create({
      data: {
        ownerId: userId,
        name: dto.name,
        description: dto.description,
        checksum,
        cards: {
          create: dto.cards.map((dc) => ({
            cardId: dc.cardId,
            quantity: dc.quantity,
          })),
        },
      },
      include: { cards: true },
    });

    return deck;
  }

  async getUserDecks(userId: string) {
    return await this.prisma.deck.findMany({
      where: { ownerId: userId },
      include: {
        cards: { include: { card: true } },
      },
    });
  }

  async getDeck(deckId: string) {
    return await this.prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        cards: { include: { card: true } },
      },
    });
  }

  async validateDeck(deckId: string, userId: string) {
    const deck = await this.getDeck(deckId);
    if (!deck || deck.ownerId !== userId) throw new Error('Deck not found');

    const currentCards = deck.cards.map((dc) => ({ cardId: dc.cardId, quantity: dc.quantity }));
    const currentChecksum = this.generateDeckChecksum(currentCards);

    return { valid: currentChecksum === deck.checksum, checksum: currentChecksum };
  }

  private generateDeckChecksum(cards: { cardId: string; quantity: number }[]): string {
    const sorted = [...cards].sort((a, b) => a.cardId.localeCompare(b.cardId));
    const str = JSON.stringify(sorted);
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
