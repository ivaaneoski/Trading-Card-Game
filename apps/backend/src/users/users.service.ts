import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        elo: true,
        wins: true,
        losses: true,
        totalGames: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getLeaderboard(limit: number = 100) {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        elo: true,
        wins: true,
        losses: true,
        totalGames: true,
      },
      orderBy: { elo: 'desc' },
      take: limit,
    });
  }

  async updateElo(userId: string, change: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { elo: { increment: change } },
    });
  }
}
