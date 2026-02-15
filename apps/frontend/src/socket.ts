import io from 'socket.io-client';

export const socket = io('http://localhost:3000/game', {
  autoConnect: false,
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export interface GameState {
  turn: number;
  currentPlayer: string;
  players: {
    id: string;
    hp: number;
    mana: number;
    hand: number;
    board: any[];
  }[];
}

export interface MatchFound {
  matchId: string;
  players: { id: string; name: string }[];
  gameState: GameState;
}

// Emitters
export const gameEvents = {
  joinQueue: (userId: string, deckId: string, queueType: 'ranked' | 'unranked', elo: number) =>
    socket.emit('join_queue', { userId, deckId, queueType, elo }),
  leaveQueue: (userId: string) => socket.emit('leave_queue', { userId }),
  playerAction: (matchId: string, userId: string, moveType: string, payload: any) =>
    socket.emit('player_action', { matchId, userId, moveType, payload }),
};

// Listeners
export const subscribeToGame = (callbacks: {
  onQueueJoined?: (data: any) => void;
  onMatchStarted?: (data: MatchFound) => void;
  onStateUpdate?: (data: GameState) => void;
  onMatchEnded?: (data: any) => void;
  onActionError?: (data: any) => void;
  onError?: (data: any) => void;
}) => {
  if (callbacks.onQueueJoined) socket.on('queue_joined', callbacks.onQueueJoined);
  if (callbacks.onMatchStarted) socket.on('match_started', callbacks.onMatchStarted);
  if (callbacks.onStateUpdate) socket.on('state_update', callbacks.onStateUpdate);
  if (callbacks.onMatchEnded) socket.on('match_ended', callbacks.onMatchEnded);
  if (callbacks.onActionError) socket.on('action_error', callbacks.onActionError);
  if (callbacks.onError) socket.on('error', callbacks.onError);
};

export const unsubscribeFromGame = () => {
  socket.off('queue_joined');
  socket.off('match_started');
  socket.off('state_update');
  socket.off('match_ended');
  socket.off('action_error');
  socket.off('error');
};
