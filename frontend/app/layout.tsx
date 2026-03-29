import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stellar DeFi • Sua Wallet',
  description: 'DeFi na Stellar com wallet criada automaticamente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} bg-stellar-navy text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}