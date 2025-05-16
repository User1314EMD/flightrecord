import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Оптимизированная загрузка шрифта
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Используем swap для быстрого отображения текста
  preload: true,
  fallback: ['system-ui', 'sans-serif'] // Резервные шрифты
});

// Импорт компонентов
import { AuthProvider } from '../src/context/AuthContext';
import { Toaster } from '../src/components/ui/sonner';
import { ThemeProvider } from '../src/components/ThemeProvider';
import ClientComponents from '../src/components/ClientComponents';

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
            <ClientComponents />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
