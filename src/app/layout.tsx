import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import QueryProvider from '@/components/providers/QueryProvider';
import UserSwitcher from '@/components/ui/UserSwitcher';
import { UserProvider } from '@/context/UserContext';
import { cn } from '@/lib/utils/cn';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Uniblox E-commerce',
  description: 'Assessment Submission',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn('min-h-screen bg-gray-50 antialiased', inter.className)}
      >
        <UserProvider>
          <QueryProvider>
            <header className="border-b bg-white">
              <div className="container mx-auto flex items-center justify-between p-4">
                <h1 className="text-xl font-bold">Uniblox Store</h1>
                <UserSwitcher />
              </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">{children}</main>
          </QueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
