import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { decksApi, cardsApi } from '../api';
import { motion } from 'framer-motion';

export const DeckBuilder: React.FC = () => {
  const user = useStore((s) => s.user);
  const cards = useStore((s) => s.cards);
  const decks = useStore((s) => s.decks);
  const setDecks = useStore((s) => s.setDecks);
  const [deckName, setDeckName] = useState('');
  const [selectedCards, setSelectedCards] = useState<Map<string, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDecks();
    loadCards();
  }, []);

  const loadDecks = async () => {
    try {
      const res = await decksApi.getMyDecks();
      setDecks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCards = async () => {
    try {
      const res = await cardsApi.getMyCards();
      useStore.setState({ cards: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCard = (cardId: string) => {
    const current = selectedCards.get(cardId) || 0;
    if (current < 3) {
      const newMap = new Map(selectedCards);
      newMap.set(cardId, current + 1);
      setSelectedCards(newMap);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    const newMap = new Map(selectedCards);
    const current = newMap.get(cardId) || 0;
    if (current > 1) {
      newMap.set(cardId, current - 1);
    } else {
      newMap.delete(cardId);
    }
    setSelectedCards(newMap);
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName) {
      alert('Enter deck name');
      return;
    }
    if (selectedCards.size === 0) {
      alert('Add at least 1 card');
      return;
    }

    setSubmitting(true);
    try {
      const deckCards = Array.from(selectedCards, ([cardId, quantity]) => ({ cardId, quantity }));
      await decksApi.create({
        name: deckName,
        cards: deckCards,
      });

      setDeckName('');
      setSelectedCards(new Map());
      await loadDecks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create deck');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCards = Array.from(selectedCards.values()).reduce((a, b) => a + b, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Cards */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Available Cards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-700 rounded-lg p-2 cursor-pointer hover:border-purple-500 border-2 border-transparent"
                onClick={() => handleAddCard(card.id)}
              >
                <img src={card.imageUrl} alt={card.name} className="w-full h-24 object-cover rounded mb-1" />
                <p className="text-xs font-bold truncate">{card.name}</p>
                <p className="text-xs text-gray-400">{card.cost}М</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Deck Builder */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Deck ({totalCards}/30)</h2>

          <form onSubmit={handleCreateDeck} className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Deck name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <button
              type="submit"
              disabled={submitting || totalCards === 0}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded text-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Deck'}
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Array.from(selectedCards, ([cardId, quantity]) => {
              const card = cards.find((c) => c.id === cardId);
              return card ? (
                <div key={cardId} className="flex justify-between items-center bg-gray-700 p-2 rounded text-sm">
                  <span className="truncate">{card.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center font-bold">x{quantity}</span>
                    <button
                      onClick={() => handleRemoveCard(cardId)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      −
                    </button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Saved Decks */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Decks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <motion.div key={deck.id} whileHover={{ scale: 1.02 }} className="bg-gray-700 rounded-lg p-4">
              <p className="font-bold">{deck.name}</p>
              <p className="text-sm text-gray-400">{deck.cards.reduce((sum, c) => sum + c.quantity, 0)} cards</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
