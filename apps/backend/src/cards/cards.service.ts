import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './cards.dto';
import * as crypto from 'crypto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async createCard(userId: string, dto: CreateCardDto) {
    // Validate card stats
    if (dto.cost < 1 || dto.cost > 10) throw new Error('Invalid cost');
    if (dto.attack < 0 || dto.attack > 10) throw new Error('Invalid attack');
    if (dto.defense < 0 || dto.defense > 10) throw new Error('Invalid defense');

    const card = await this.prisma.card.create({
      data: {
        ownerId: userId,
        name: dto.name,
        imageUrl: dto.imageUrl,
        cost: dto.cost,
        attack: dto.attack,
        defense: dto.defense,
        abilities: JSON.stringify(dto.abilities || []),
        rarity: dto.rarity || 'common',
        isApproved: true, // In production, add moderation queue
      },
    });

    return card;
  }

  async getUserCards(userId: string) {
    return await this.prisma.card.findMany({
      where: { ownerId: userId },
    });
  }

  async getPublicCards() {
    return await this.prisma.card.findMany({
      where: { isApproved: true },
      take: 100,
    });
  }

  async getCard(cardId: string) {
    return await this.prisma.card.findUnique({ where: { id: cardId } });
  }
}
