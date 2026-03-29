'use client';
import { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/users/signup', { email, password });
      setMessage(res.data.message);
      // Redireciona para login
      window.location.href = '/login';
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stellar-navy to-[#001F3F]">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Star className="w-12 h-12 text-stellar-cyan" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Crie sua conta Stellar</h1>
        <p className="text-center text-gray-400 mb-8">Sua wallet na blockchain é criada automaticamente</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="w-full py-4 bg-stellar-cyan hover:bg-cyan-400 transition text-stellar-navy font-semibold rounded-2xl text-lg"
          >
            Criar conta e wallet
          </button>
        </form>

        {message && <p className="text-center mt-4 text-stellar-cyan">{message}</p>}
      </div>
    </div>
  );
}