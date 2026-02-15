import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { DecksModule } from './decks/decks.module';
import { MatchesModule } from './matches/matches.module';
import { GameModule } from './game/game.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '24h' },
    }),
    PassportModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CardsModule,
    DecksModule,
    MatchesModule,
    GameModule,
    UploadsModule,
  ],
})
export class AppModule {}
