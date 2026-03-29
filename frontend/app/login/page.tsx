'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Star } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('http://localhost:3000/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : 'Email ou senha inválidos';
      setMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stellar-navy to-[#001F3F]">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <Star className="w-12 h-12 text-stellar-cyan" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Entrar</h1>
        <p className="text-center text-gray-400 mb-8">Acesse sua conta Stellar DeFi</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-400"
          />
          <button
            type="submit"
            className="w-full py-4 bg-stellar-cyan hover:bg-cyan-400 transition text-stellar-navy font-semibold rounded-2xl text-lg"
          >
            Entrar
          </button>
        </form>

        {message && <p className="text-center mt-4 text-red-300 text-sm">{message}</p>}

        <p className="text-center mt-6 text-gray-400 text-sm">
          Não tem conta?{' '}
          <Link href="/signup" className="text-stellar-cyan hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
