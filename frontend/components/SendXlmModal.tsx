'use client';

import { useState } from 'react';
import axios from 'axios';
import { X, Send, Loader2, CheckCircle } from 'lucide-react';

interface SendXlmModalProps {
  onClose: () => void;
  onSuccess?: (hash: string) => void;
}

export default function SendXlmModal({ onClose, onSuccess }: SendXlmModalProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3000/wallet/send-xlm', { to, amount });
      setTxHash(res.data.hash);
      onSuccess?.(res.data.hash);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar XLM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0d2d4a] border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Send className="w-5 h-5 text-stellar-cyan" />
            Enviar XLM
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {txHash ? (
          <div className="text-center py-4">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Enviado com sucesso!</p>
            <p className="text-xs text-gray-400 mb-1">Hash da transação:</p>
            <p className="font-mono text-xs text-stellar-cyan break-all bg-white/5 rounded-xl p-3">
              {txHash}
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 bg-stellar-cyan hover:bg-cyan-400 text-stellar-navy font-semibold rounded-2xl transition"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Endereço destino
              </label>
              <input
                type="text"
                placeholder="G..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">
                Quantidade (XLM)
              </label>
              <input
                type="number"
                placeholder="0.00"
                min="0.0000001"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:border-stellar-cyan text-white placeholder-gray-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/20 hover:bg-white/10 rounded-2xl transition text-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-stellar-cyan hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-stellar-navy font-semibold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
