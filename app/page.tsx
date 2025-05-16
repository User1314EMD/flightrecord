"use client";

import { useState, Suspense, lazy } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from 'next/dynamic';

// Динамический импорт компонентов
const Button = dynamic(() => import("../src/components/ui/button").then(mod => mod.Button), { ssr: false });

// Ленивый импорт контекста аутентификации
import { useAuth } from "../src/context/AuthContext";

export default function Home() {
  const { user, loading, setUser } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Обработчик выхода из аккаунта
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      // Динамический импорт функции выхода
      const { signOut } = await import("../src/lib/firebase/auth");
      await signOut();

      // Сохраняем состояние в localStorage
      localStorage.setItem('auth_state', 'logged_out');

      // Обновляем состояние пользователя в контексте
      setUser(null);

      toast.success("Вы вышли из аккаунта");
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      toast.error("Ошибка при выходе из аккаунта");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Показываем контент сразу, даже если идет загрузка
  // Это улучшает воспринимаемую скорость загрузки

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Добро пожаловать в FlightRecord
        </h1>
        <p className="text-xl mb-8 text-center">
          Приложение для хранения и обмена информацией о рейсах
        </p>

        {user ? (
          // Пользователь авторизован
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-2">Вы вошли как <span className="font-bold">{user.name}</span></p>
              <p className="text-md">Email: {user.email}</p>
              <p className="text-md">Всего рейсов: {user.totalFlights || 0}</p>
              <p className="text-md">Время в воздухе: {user.totalAirTime ? `${Math.floor(user.totalAirTime / 60)} ч ${user.totalAirTime % 60} мин` : '0 ч 0 мин'}</p>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={() => router.push('/flights')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Мои рейсы
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Выход..." : "Выйти"}
              </Button>
              <Button
                onClick={() => router.push('/test-protected')}
                className="bg-green-600 hover:bg-green-700 mt-2 w-full"
              >
                Проверить защищенный маршрут
              </Button>
            </div>
          </div>
        ) : (
          // Пользователь не авторизован
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-600 hover:bg-green-700">
                Зарегистрироваться
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
