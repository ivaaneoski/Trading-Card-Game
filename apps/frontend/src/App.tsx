import React from 'react';
import './globals.css';
import { useStore } from './store';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GameBoard } from './pages/GameBoard';

function App() {
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);

  if (!token) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Dashboard />
    </div>
  );
}

export default App;
