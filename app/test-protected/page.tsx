"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import { Button } from "../../src/components/ui/button";
import { useAuth } from "../../src/context/AuthContext";

export default function TestProtectedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Защищенная страница</h1>
          <Button onClick={() => router.push("/")}>На главную</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Поздравляем, {user?.name}!
            </h2>
            <p className="text-lg mb-2">
              Вы успешно получили доступ к защищенной странице.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Это означает, что система аутентификации работает корректно.
            </p>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md mb-6">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✅ Защита маршрута работает
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Неавторизованные пользователи будут перенаправлены на страницу входа.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => router.push('/flights')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Перейти к рейсам
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
            >
              Вернуться на главную
            </Button>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
