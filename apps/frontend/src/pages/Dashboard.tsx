import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { cardsApi, decksApi, matchesApi } from '../api';
import { socket, gameEvents, subscribeToGame } from '../socket';
import { CardEditor } from '../components/CardEditor';
import { DeckBuilder } from '../components/DeckBuilder';
import { GameBoard } from './GameBoard';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const user = useStore((s) => s.user);
  const [tab, setTab] = useState<'play' | 'cards' | 'decks' | 'profile'>('play');
  const [loading, setLoading] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const logout = useStore((s) => s.logout);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  if (matchId) {
    return <GameBoard matchId={matchId} onExit={() => setMatchId(null)} />;
  }

  const PlayQueue = () => {
    const [queueing, setQueueing] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const decks = useStore((s) => s.decks);

    const handleQueue = (type: 'ranked' | 'unranked') => {
      if (!selectedDeck) return alert('Select a deck');
      setQueueing(true);
      gameEvents.joinQueue(user!.id, selectedDeck, type, user!.elo);

      subscribeToGame({
        onMatchStarted: (data) => {
          setMatchId(data.matchId);
          setQueueing(false);
        },
        onError: (data) => {
          alert(data.message);
          setQueueing(false);
        },
      });
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Select Deck</h2>
          <select
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white mb-4"
          >
            <option value="">Choose a deck...</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>

          <div className="flex gap-4">
            <button
              onClick={() => handleQueue('unranked')}
              disabled={queueing}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50"
            >
              {queueing ? 'Searching...' : 'Unranked'}
            </button>
            <button
              onClick={() => handleQueue('ranked')}
              disabled={queueing}
              className="flex-1 py-3 bg-gold-600 hover:bg-yellow-700 text-white font-bold rounded disabled:opacity-50"
            >
              {queueing ? 'Searching...' : 'Ranked (ELO: ' + user!.elo + ')'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          TCG Arena
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold">{user?.username}</p>
            <p className="text-sm text-gray-400">ELO: {user?.elo}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {(['play', 'cards', 'decks', 'profile'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-semibold transition capitalize ${
              tab === t ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {tab === 'play' && <PlayQueue />}
          {tab === 'cards' && <CardEditor />}
          {tab === 'decks' && <DeckBuilder />}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Stats</h3>
            <div className="space-y-1 text-sm">
              <p>Wins: {user?.wins}</p>
              <p>Losses: {user?.losses}</p>
              <p>Win Rate: {((user?.wins || 0) / ((user?.wins || 0) + (user?.losses || 0)) * 100 || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
