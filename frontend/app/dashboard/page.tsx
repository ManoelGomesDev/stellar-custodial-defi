'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';   // ← IMPORTANTE: novo import
import axios from 'axios';
import { Wallet, Send, Zap, LogOut, Star } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();                  // ← Hook do Next.js
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Redireciona se não tiver token (sem retornar string!)
    if (!token) {
      router.replace('/login');   // ← Correção aqui
      return;
    }

    // Configura o header de autenticação
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Busca dados do usuário + saldo
    axios
      .get('http://localhost:3000/users/me')        // vamos criar essa rota no backend
      .then((res) => {
        setUser(res.data);
        return axios.get(
          `http://localhost:3000/wallet/balance?publicKey=${res.data.stellarPublicKey}`
        );
      })
      .then((res) => setBalance(res.data.balance))
      .catch(() => router.replace('/login'))        // se der erro, volta pro login
      .finally(() => setLoading(false));
  }, [router]);   // ← router no array de dependências

  if (loading) {
    return (
      <div className="min-h-screen bg-stellar-navy flex items-center justify-center">
        <div className="text-center">
          <Star className="w-12 h-12 text-stellar-cyan mx-auto animate-pulse" />
          <p className="text-gray-400 mt-4">Carregando sua wallet estelar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stellar-navy flex">
      {/* Sidebar clean e moderna */}
      <div className="w-72 bg-white/5 border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <Star className="w-8 h-8 text-stellar-cyan" />
          <h1 className="text-2xl font-bold tracking-tight">Stellar DeFi</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 text-stellar-cyan rounded-2xl font-medium"
          >
            <Wallet className="w-5 h-5" />
            Wallet
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <Zap className="w-5 h-5" />
            DeFi (Mint Token)
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <Send className="w-5 h-5" />
            Enviar XLM
          </a>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.replace('/login');
          }}
          className="flex items-center gap-3 text-red-400 hover:text-red-500 transition-colors mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 p-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-light mb-1">Olá, {user?.email}</h2>
          <p className="text-gray-400">Bem-vindo à sua wallet na Stellar Testnet</p>

          <div className="mt-12 grid grid-cols-2 gap-8">
            {/* Card do Saldo */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="flex justify-between items-start">
                <div>
                  <p className="uppercase text-xs tracking-[1px] text-gray-400">Saldo XLM</p>
                  <p className="text-6xl font-light mt-3 text-white">{balance}</p>
                </div>
                <Star className="w-10 h-10 text-stellar-cyan" />
              </div>
              <div className="mt-8 font-mono text-xs text-stellar-cyan break-all">
                {user?.stellarPublicKey}
              </div>
            </div>

            {/* Card Ações DeFi */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl mb-6">Ações DeFi</h3>
              <button
                onClick={() => alert('Em breve: endpoint de mint')}
                className="w-full py-4 bg-stellar-cyan hover:bg-cyan-400 text-stellar-navy font-semibold rounded-2xl transition-all active:scale-95"
              >
                Mintar Token Fake
              </button>
              <button className="mt-4 w-full py-4 border border-white/30 hover:bg-white/10 rounded-2xl transition-all">
                Transferir XLM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}