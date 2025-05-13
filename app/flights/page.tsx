"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import { Button } from "../../src/components/ui/button";
import { useAuth } from "../../src/context/AuthContext";

export default function FlightsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Мои рейсы</h1>
          <Button onClick={() => router.push("/")}>На главную</Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <p className="text-lg mb-4">
            Здесь будет отображаться список ваших рейсов, {user?.name}.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Функционал добавления и просмотра рейсов будет реализован на следующем этапе разработки.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
