'use client';

import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-display' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60000, retry: 1 } } }));
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
        <Toaster position="top-right" toastOptions={{ style: { background: '#08081a', color: '#c8c8e8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '13px' } }} />
      </body>
    </html>
  );
}
