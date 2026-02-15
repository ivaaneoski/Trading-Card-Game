import React, { useState } from 'react';
import { useStore } from '../store';
import { authApi } from '../api';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setUser = useStore((s) => s.setUser);
  const setToken = useStore((s) => s.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'login') {
        response = await authApi.login(username, password);
      } else {
        response = await authApi.register(username, email, password);
      }

      const { accessToken, user } = response.data;
      setToken(accessToken);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-purple-500 border-opacity-30">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">TCG Arena</h1>
          <p className="text-gray-400 text-center mb-8">Browser-based Trading Card Game</p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded font-semibold transition ${
                mode === 'login' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded font-semibold transition ${
                mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              required
            />
            {mode === 'register' && (
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                required
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              required
            />

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
