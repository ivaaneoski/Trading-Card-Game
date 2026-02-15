import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CardsService } from '../cards/cards.service';
import {
  GameState,
  Move,
  BoardCard,
  BOARD_SLOTS,
  STARTING_HP,
  STARTING_HAND_SIZE,
  MAX_MANA,
} from './game.types';
import * as crypto from 'crypto';

@Injectable()
export class GameEngine {
  private logger = new Logger('GameEngine');

  constructor(private prisma: PrismaService, private cardsService: CardsService) {}

  // Initialize game state from two decks
  async initializeGame(matchId: string, player1Id: string, deck1: any[], player2Id: string, deck2: any[]): Promise<GameState> {
    const deck1Shuffled = this.shuffle(deck1);
    const deck2Shuffled = this.shuffle(deck2);

    const state: GameState = {
      matchId,
      turn: 1,
      currentPlayerIndex: 0,
      players: [
        {
          id: player1Id,
          deck: deck1Shuffled.slice(STARTING_HAND_SIZE),
          hand: deck1Shuffled.slice(0, STARTING_HAND_SIZE).map((c, i) => this.createBoardCard(c, player1Id, i)),
          board: [],
          hp: STARTING_HP,
          mana: 1,
          maxMana: 1,
        },
        {
          id: player2Id,
          deck: deck2Shuffled.slice(STARTING_HAND_SIZE),
          hand: deck2Shuffled.slice(0, STARTING_HAND_SIZE).map((c, i) => this.createBoardCard(c, player2Id, i)),
          board: [],
          hp: STARTING_HP,
          mana: 1,
          maxMana: 1,
        },
      ],
      log: [],
      replay: [],
    };

    return state;
  }

  // Validate and execute a move
  async executeMove(state: GameState, move: Move): Promise<{ valid: boolean; error?: string; newState?: GameState }> {
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Verify move is from current player
    if (move.playerId !== currentPlayer.id) {
      return { valid: false, error: 'Not your turn' };
    }

    try {
      switch (move.type) {
        case 'play_card':
          return this.validatePlayCard(state, move, currentPlayer);
        case 'attack':
          return this.validateAttack(state, move, currentPlayer);
        case 'ability':
          return this.validateAbility(state, move, currentPlayer);
        case 'pass':
          return this.endTurn(state);
        default:
          return { valid: false, error: 'Invalid move type' };
      }
    } catch (e) {
      this.logger.error(`Move validation error: ${e.message}`, e.stack);
      return { valid: false, error: 'Server error during validation' };
    }
  }

  private validatePlayCard(state: GameState, move: Move, player: any): { valid: boolean; error?: string; newState?: GameState } {
    const { cardInstanceId, slot } = move.payload;

    // Validate slot
    if (slot < 0 || slot >= BOARD_SLOTS) return { valid: false, error: 'Invalid board slot' };
    if (player.board[slot]) return { valid: false, error: 'Slot occupied' };

    // Find card in hand
    const cardIndex = player.hand.findIndex((c) => c.instanceId === cardInstanceId);
    if (cardIndex === -1) return { valid: false, error: 'Card not in hand' };

    const card = player.hand[cardIndex];

    // Validate mana
    if (card.cost > player.mana) return { valid: false, error: 'Not enough mana' };

    // Execute: move to board, deduct mana
    const newState = JSON.parse(JSON.stringify(state));
    const newPlayer = newState.players[newState.currentPlayerIndex];
    newPlayer.board[slot] = newPlayer.hand.splice(cardIndex, 1)[0];
    newPlayer.mana -= card.cost;
    newState.log.push({ ...move, validated: true });

    return { valid: true, newState };
  }

  private validateAttack(state: GameState, move: Move, player: any): { valid: boolean; error?: string; newState?: GameState } {
    const { attackerSlot, targetSlot } = move.payload;
    const opponent = state.players[1 - state.currentPlayerIndex];

    // Validate attacker
    if (attackerSlot < 0 || attackerSlot >= BOARD_SLOTS) return { valid: false, error: 'Invalid attacker slot' };
    if (!player.board[attackerSlot]) return { valid: false, error: 'No card at attacker slot' };

    const attacker = player.board[attackerSlot];

    // Validate target (can be opponent or direct)
    let target: any = null;
    if (targetSlot !== -1) {
      if (targetSlot < 0 || targetSlot >= BOARD_SLOTS) return { valid: false, error: 'Invalid target slot' };
      target = opponent.board[targetSlot];
      if (!target) return { valid: false, error: 'No card at target slot' };
    }

    // Execute attack
    const newState = JSON.parse(JSON.stringify(state));
    const newPlayer = newState.players[newState.currentPlayerIndex];
    const newOpponent = newState.players[1 - newState.currentPlayerIndex];
    const newAttacker = newPlayer.board[attackerSlot];

    if (targetSlot === -1) {
      // Direct attack to opponent
      newOpponent.hp -= newAttacker.attack;
    } else {
      // Card-to-card combat
      const newTarget = newOpponent.board[targetSlot];
      newTarget.currentHp -= newAttacker.attack;
      if (newTarget.currentHp <= 0) {
        newOpponent.board.splice(targetSlot, 1);
      }
      newAttacker.currentHp -= newTarget.defense;
      if (newAttacker.currentHp <= 0) {
        newPlayer.board.splice(attackerSlot, 1);
      }
    }

    newState.log.push({ ...move, validated: true });
    return { valid: true, newState };
  }

  private validateAbility(state: GameState, move: Move, player: any): { valid: boolean; error?: string; newState?: GameState } {
    // Simplified ability system (extend per use-case)
    return { valid: false, error: 'Abilities not yet implemented' };
  }

  private endTurn(state: GameState): { valid: boolean; error?: string; newState?: GameState } {
    const newState = JSON.parse(JSON.stringify(state));

    // Next player
    const nextPlayerIndex = 1 - newState.currentPlayerIndex;
    newState.currentPlayerIndex = nextPlayerIndex;
    newState.turn++;

    const nextPlayer = newState.players[nextPlayerIndex];
    // Increment mana up to max
    nextPlayer.maxMana = Math.min(nextPlayer.maxMana + MANA_INCREMENT, MAX_MANA);
    nextPlayer.mana = nextPlayer.maxMana;

    // Draw card
    if (nextPlayer.deck.length > 0) {
      const card = nextPlayer.deck.shift();
      nextPlayer.hand.push(card);
    }

    return { valid: true, newState };
  }

  private createBoardCard(cardId: string, playerId: string, instanceId: number): BoardCard {
    return {
      cardId,
      instanceId: `${cardId}-${Date.now()}-${instanceId}`,
      ownerId: playerId,
      name: `Card ${cardId}`,
      cost: 1,
      attack: 1,
      defense: 1,
      currentHp: 1,
      abilities: [],
      position: -1,
    };
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  generateReplayChecksum(replay: Move[]): string {
    const str = JSON.stringify(replay);
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
