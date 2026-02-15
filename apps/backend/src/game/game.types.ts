// Card instance in play
export interface BoardCard {
  cardId: string;
  instanceId: string; // Unique per-match instance
  ownerId: string;
  name: string;
  cost: number;
  attack: number;
  defense: number;
  currentHp: number;
  abilities: string[];
  position: number; // Board slot 0-4
}

// Game state (server-authoritative)
export interface GameState {
  matchId: string;
  turn: number;
  currentPlayerIndex: number; // 0 or 1
  players: {
    id: string;
    deck: string[];
    hand: BoardCard[];
    board: BoardCard[];
    hp: number;
    mana: number;
    maxMana: number;
  }[];
  log: Move[];
  replay: Move[];
}

// Move on the board
export interface Move {
  turn: number;
  playerId: string;
  type: 'play_card' | 'attack' | 'ability' | 'pass';
  payload: any;
  timestamp: number;
  validated: boolean;
  error?: string;
}

export const BOARD_SLOTS = 5;
export const STARTING_HP = 20;
export const STARTING_HAND_SIZE = 3;
export const MANA_INCREMENT = 1;
export const MAX_MANA = 10;
