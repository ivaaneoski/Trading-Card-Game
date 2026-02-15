// Shared types between frontend and backend
export interface User {
  id: string;
  username: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  avatar?: string;
  bio?: string;
}

export interface GameCard {
  id: string;
  ownerId: string;
  name: string;
  imageUrl: string;
  cost: number;
  attack: number;
  defense: number;
  abilities: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isApproved: boolean;
}

export interface Deck {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  cards: Array<{ cardId: string; quantity: number }>;
  checksum: string;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  status: 'pending' | 'active' | 'completed';
  winner?: string;
  eloChange1: number;
  eloChange2: number;
  replayUrl?: string;
  startedAt?: Date;
  endedAt?: Date;
}

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
  },
  USERS: {
    PROFILE: (username: string) => `/users/${username}`,
    LEADERBOARD: '/users',
  },
  CARDS: {
    CREATE: '/cards',
    MY: '/cards/my',
    PUBLIC: '/cards',
  },
  DECKS: {
    CREATE: '/decks',
    MY: '/decks/my',
    VALIDATE: '/decks/validate',
  },
  MATCHES: {
    HISTORY: '/matches/history',
    FORFEIT: '/matches/forfeit',
  },
  UPLOADS: {
    PRESIGNED: '/uploads/request-upload',
    CONFIRM: '/uploads/confirm-upload',
  },
};

export const WS_EVENTS = {
  GAME: {
    JOIN_QUEUE: 'join_queue',
    LEAVE_QUEUE: 'leave_queue',
    QUEUE_JOINED: 'queue_joined',
    MATCH_FOUND: 'match_found',
    MATCH_STARTED: 'match_started',
    PLAYER_ACTION: 'player_action',
    STATE_UPDATE: 'state_update',
    ACTION_ERROR: 'action_error',
    MATCH_ENDED: 'match_ended',
  },
};
