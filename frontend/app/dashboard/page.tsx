'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Wallet, Send, Zap, LogOut, Star } from 'lucide-react';
import SendXlmModal from '../../components/SendXlmModal';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [txHash, setTxHash] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return router.replace('/login');

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    axios.get('http://localhost:3000/users/me')
      .then((res) => {
        setUser(res.data);
        return axios.get('http://localhost:3000/wallet/balance');
      })
      .then((res) => setBalance(res.data.balance))
      .catch(() => handleLogout())
      .finally(() => setLoading(false));
  }, [router, handleLogout]);

  const handleMint = async () => {
    try {
      const res = await axios.post('http://localhost:3000/wallet/mint', { amount: '1000' });
      setTxHash(res.data.hash);
    } catch {
      alert('Erro ao mintar token');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stellar-navy flex items-center justify-center text-white">
        <Star className="w-8 h-8 text-stellar-cyan animate-pulse mr-3" />
        Carregando wallet...
      </div>
    );
  }

  return (
    <>
      {showSendModal && (
        <SendXlmModal
          onClose={() => setShowSendModal(false)}
          onSuccess={(hash) => {
            setTxHash(hash);
            setShowSendModal(false);
          }}
        />
      )}

      <div className="min-h-screen bg-stellar-navy flex">
        {/* Sidebar */}
        <div className="w-72 bg-white/5 border-r border-white/10 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <Star className="w-8 h-8 text-stellar-cyan" />
            <h1 className="text-2xl font-bold">Stellar DeFi</h1>
          </div>
          <nav className="space-y-2 flex-1">
            <div className="flex items-center gap-3 px-4 py-3 bg-white/10 text-stellar-cyan rounded-2xl font-medium">
              <Wallet className="w-5 h-5" /> Wallet
            </div>
            <button
              onClick={handleMint}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-2xl transition text-left"
            >
              <Zap className="w-5 h-5" /> Mint Token DeFi
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-2xl transition text-left"
            >
              <Send className="w-5 h-5" /> Enviar XLM
            </button>
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-500 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 p-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-light">Olá, {user?.email}</h2>
            <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <p className="uppercase text-xs tracking-widest text-gray-400">Saldo XLM</p>
              <p className="text-6xl font-light mt-2">{balance}</p>
              <p className="font-mono text-xs text-stellar-cyan mt-8 break-all">{user?.stellarPublicKey}</p>
            </div>

            {txHash && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <p className="text-xs text-gray-400 mb-1">Última transação</p>
                <p className="font-mono text-xs text-stellar-cyan break-all">{txHash}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
