import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';
import { Toaster } from '../src/components/ui/sonner';
import { ThemeProvider } from '../src/components/ThemeProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'FlightRecord - Приложение для хранения и обмена информацией о рейсах',
  description: 'Храните, просматривайте и управляйте информацией о своих авиаперелетах',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
