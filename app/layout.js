import { Inter } from 'next/font/google';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { OfflineIndicator } from '@/components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mercury Black B16',
  description: 'Almaden Mercury Black B16 Team App',
  manifest: '/manifest.json',
  themeColor: '#00843D',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mercury B16',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <OfflineIndicator />
        <main className="min-h-screen pb-20 bg-gray-50">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}