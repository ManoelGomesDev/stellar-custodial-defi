import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-stellar-navy flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-light text-white mb-4">Stellar DeFi</h1>
        <p className="text-xl text-gray-400 mb-8">Sua wallet na blockchain criada automaticamente</p>
        
        <div className="space-x-4">
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-stellar-cyan text-stellar-navy font-semibold rounded-2xl hover:scale-105 transition"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="inline-block px-8 py-4 border border-white/30 text-white font-medium rounded-2xl hover:bg-white/10 transition"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}