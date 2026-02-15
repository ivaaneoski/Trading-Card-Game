import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { socket, gameEvents, subscribeToGame, GameState } from '../socket';
import { motion } from 'framer-motion';

interface GameBoardProps {
  matchId: string;
  onExit: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ matchId, onExit }) => {
  const user = useStore((s) => s.user);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [matchEnded, setMatchEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    subscribeToGame({
      onStateUpdate: (data) => {
        setGameState(data);
      },
      onMatchEnded: (data) => {
        setWinner(data.winner);
        setMatchEnded(true);
      },
      onActionError: (data) => {
        alert('Invalid move: ' + data.error);
      },
    });

    return () => {
      socket.off('state_update');
      socket.off('match_ended');
      socket.off('action_error');
    };
  }, [matchId]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading match...</p>
      </div>
    );
  }

  const currentPlayer = gameState.players[0];
  const opponent = gameState.players[1];
  const isMyTurn = gameState.currentPlayer === user?.id;

  const handlePlayCard = (cardIndex: number, slot: number) => {
    const hand = currentPlayer.hand;
    if (hand[cardIndex] && slot < 5) {
      gameEvents.playerAction(matchId, user!.id, 'play_card', {
        cardInstanceId: hand[cardIndex],
        slot,
      });
    }
  };

  const handleAttack = (attackerSlot: number, targetSlot: number = -1) => {
    gameEvents.playerAction(matchId, user!.id, 'attack', { attackerSlot, targetSlot });
  };

  const handlePass = () => {
    gameEvents.playerAction(matchId, user!.id, 'pass', {});
  };

  if (matchEnded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen bg-gray-900"
      >
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {winner === user?.id ? '🎉 Victory!' : '💔 Defeat'}
          </h1>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Opponent Side */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{opponent.id}</h3>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3, repeat: matchEnded ? 0 : 1 }}
              className="text-3xl font-bold text-red-500"
            >
              {opponent.hp} ❤️
            </motion.div>
          </div>
          {/* Opponent Board */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-2">
              {opponent.board.map((card, i) => (
                <div
                  key={i}
                  className="bg-gray-700 rounded aspect-square flex items-end justify-center p-2 cursor-pointer hover:bg-gray-600"
                  onClick={() => handleAttack(i)}
                >
                  <p className="text-white text-xs font-bold">{card?.attack}/H</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="text-center mb-4">
          <p className="text-xl font-bold">Turn {gameState.turn}</p>
          <p className={`text-lg ${isMyTurn ? 'text-green-400' : 'text-gray-400'}`}>
            {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
          </p>
        </div>

        {/* Your Side */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{currentPlayer.id}</h3>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-green-500"
            >
              {currentPlayer.hp} ❤️
            </motion.div>
          </div>

          {/* Your Board */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-5 gap-2">
              {currentPlayer.board.map((card, i) => (
                <div
                  key={i}
                  className="bg-purple-700 rounded aspect-square flex items-end justify-center p-2 cursor-pointer hover:bg-purple-600"
                  onClick={() => handleAttack(i, -1)}
                >
                  <p className="text-white text-xs font-bold">{card?.attack}/H</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mana */}
          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-semibold">Mana:</div>
            <div className="flex gap-1">
              {Array.from({ length: currentPlayer.mana }).map((_, i) => (
                <div key={i} className="w-6 h-6 bg-blue-500 rounded-full" />
              ))}
            </div>
            <span className="text-gray-400">/ {currentPlayer.mana} max</span>
          </div>

          {/* Hand */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">Hand ({currentPlayer.hand})</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* Cards would be rendered here based on actual hand data */}
              <p className="text-xs text-gray-500">Cards display pending full game state</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePass}
              disabled={!isMyTurn}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded"
            >
              Pass Turn
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
            >
              Forfeit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
