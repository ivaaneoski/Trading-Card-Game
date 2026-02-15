import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MatchesService } from '../matches/matches.service';
import { GameEngine } from '../game/game.engine';
import { DecksService } from '../decks/decks.service';

interface QueuedPlayer {
  userId: string;
  deckId: string;
  socket: Socket;
  elo: number;
}

@WebSocketGateway({ namespace: 'game', cors: { origin: '*' } })
@Injectable()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('GameGateway');
  private rankedQueue: QueuedPlayer[] = [];
  private unrankedQueue: QueuedPlayer[] = [];
  private playerSockets: Map<string, Socket> = new Map();
  private matchStates: Map<string, any> = new Map();

  constructor(
    private matchesService: MatchesService,
    private gameEngine: GameEngine,
    private decksService: DecksService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from queues
    this.rankedQueue = this.rankedQueue.filter((p) => p.socket.id !== client.id);
    this.unrankedQueue = this.unrankedQueue.filter((p) => p.socket.id !== client.id);
  }

  @SubscribeMessage('join_queue')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; deckId: string; queueType: 'ranked' | 'unranked'; elo: number },
  ) {
    const { userId, deckId, queueType, elo } = data;

    const player: QueuedPlayer = { userId, deckId, socket: client, elo };
    const queue = queueType === 'ranked' ? this.rankedQueue : this.unrankedQueue;
    queue.push(player);

    this.playerSockets.set(userId, client);
    client.emit('queue_joined', { queueType, position: queue.length });

    this.logger.log(`${userId} joined ${queueType} queue`);

    // Try to match
    this.tryMatchmake(queue, queueType);
  }

  @SubscribeMessage('leave_queue')
  handleLeaveQueue(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    const { userId } = data;
    this.rankedQueue = this.rankedQueue.filter((p) => p.userId !== userId);
    this.unrankedQueue = this.unrankedQueue.filter((p) => p.userId !== userId);
    client.emit('queue_left');
  }

  @SubscribeMessage('player_action')
  async handlePlayerAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; userId: string; moveType: string; payload: any },
  ) {
    const { matchId, userId, moveType, payload } = data;
    const state = this.matchStates.get(matchId);

    if (!state) {
      client.emit('error', { message: 'Match not found' });
      return;
    }

    const move = {
      matchId,
      playerId: userId,
      type: moveType,
      payload,
      timestamp: Date.now(),
      validated: false,
    };

    const result = await this.gameEngine.executeMove(state, move);

    if (!result.valid) {
      client.emit('action_error', { error: result.error });
      return;
    }

    // Update state and broadcast to both players
    const newState = result.newState!;
    this.matchStates.set(matchId, newState);

    const room = `match-${matchId}`;
    this.server.to(room).emit('state_update', {
      turn: newState.turn,
      currentPlayer: newState.players[newState.currentPlayerIndex].id,
      players: newState.players.map((p) => ({
        id: p.id,
        hp: p.hp,
        mana: p.mana,
        hand: p.hand.length,
        board: p.board,
      })),
    });

    // Check for win condition
    if (newState.players[0].hp <= 0 || newState.players[1].hp <= 0) {
      const winnerId = newState.players[0].hp > 0 ? newState.players[0].id : newState.players[1].id;
      await this.endMatch(matchId, winnerId);
    }
  }

  private tryMatchmake(queue: QueuedPlayer[], queueType: string) {
    if (queue.length < 2) return;

    // Simple matchmaking: pair first two players
    const player1 = queue.shift()!;
    const player2 = queue.shift()!;

    this.startMatch(player1, player2, queueType);
  }

  private async startMatch(player1: QueuedPlayer, player2: QueuedPlayer, queueType: string) {
    try {
      const match = await this.matchesService.createMatch(
        player1.userId,
        player1.deckId,
        player2.userId,
        player2.deckId,
      );

      // Initialize game state
      const deck1Cards = await this.getCardIds(player1.deckId);
      const deck2Cards = await this.getCardIds(player2.deckId);
      const gameState = await this.gameEngine.initializeGame(
        match.id,
        player1.userId,
        deck1Cards,
        player2.userId,
        deck2Cards,
      );

      this.matchStates.set(match.id, gameState);

      const room = `match-${match.id}`;
      player1.socket.join(room);
      player2.socket.join(room);

      this.server.to(room).emit('match_started', {
        matchId: match.id,
        players: [
          { id: player1.userId, name: player1.userId },
          { id: player2.userId, name: player2.userId },
        ],
        gameState,
      });

      this.logger.log(`Match ${match.id} started between ${player1.userId} and ${player2.userId}`);
    } catch (e) {
      this.logger.error(`Failed to start match: ${e.message}`);
      player1.socket.emit('error', { message: 'Failed to start match' });
      player2.socket.emit('error', { message: 'Failed to start match' });
    }
  }

  private async endMatch(matchId: string, winnerId: string) {
    const eloChange = { winner: 32, loser: -32 };

    await this.matchesService.endMatch(matchId, winnerId, {
      [winnerId]: eloChange.winner,
      [this.getOpponentId(matchId, winnerId)]: eloChange.loser,
    });

    const room = `match-${matchId}`;
    this.server.to(room).emit('match_ended', { winner: winnerId });
    this.server.to(room).socketsLeave(room);

    this.matchStates.delete(matchId);
  }

  private async getCardIds(deckId: string): Promise<string[]> {
    const deck = await this.decksService.getDeck(deckId);
    const cards: string[] = [];
    for (const dc of deck!.cards) {
      for (let i = 0; i < dc.quantity; i++) {
        cards.push(dc.cardId);
      }
    }
    return cards;
  }

  private getOpponentId(matchId: string, playerId: string): string {
    const state = this.matchStates.get(matchId);
    return state.players[0].id === playerId ? state.players[1].id : state.players[0].id;
  }
}
