import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
}

export interface GameCard {
  id: string;
  name: string;
  imageUrl: string;
  cost: number;
  attack: number;
  defense: number;
  abilities: string[];
  rarity: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: { card: GameCard; quantity: number }[];
  checksum: string;
}

interface Store {
  user: User | null;
  token: string | null;
  cards: GameCard[];
  decks: Deck[];
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setCards: (cards: GameCard[]) => void;
  setDecks: (decks: Deck[]) => void;
  logout: () => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  cards: [],
  decks: [],
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  setCards: (cards) => set({ cards }),
  setDecks: (decks) => set({ decks }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
