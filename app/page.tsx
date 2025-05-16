"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Импорт компонентов UI
import { Button } from "../src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../src/components/ui/card";
import { Badge } from "../src/components/ui/badge";
import { Separator } from "../src/components/ui/separator";

// Импорт иконок
import { Plane, User, LogIn, UserPlus, LogOut, BarChart3, Search, Clock, Calendar, MapPin, Info, Loader2 } from "lucide-react";

// Импорт контекста аутентификации
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

  // Эффект для анимации появления элементов
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Верхняя панель навигации */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">
              Flight<span className="text-blue-600">Record</span>
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {user.name}
              </Badge>
              {isLoggingOut ? (
                <Button size="sm" variant="ghost" disabled>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" /> Выход...
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" /> Выйти
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Шапка */}
        <div className={`text-center mb-12 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 bg-blue-600 rounded-full p-4 shadow-lg">
              <Plane className="w-full h-full text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            Добро пожаловать в FlightRecord
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Храните, анализируйте и делитесь информацией о ваших авиаперелетах
          </p>
        </div>

        {/* Основной контент */}
        <div className={`max-w-6xl mx-auto transition-all duration-700 delay-200 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {user ? (
            // Пользователь авторизован
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Карточка профиля */}
              <Card className="bg-white border border-gray-200 shadow-sm lg:col-span-1">
                <CardHeader className="bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                      <User className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-gray-800">Профиль</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Имя пользователя</span>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-gray-800">{user.email}</span>
                  </div>
                  <Separator className="bg-gray-200" />
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Всего рейсов</span>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {user.totalFlights || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Время в воздухе</span>
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {user.totalAirTime ? `${Math.floor(user.totalAirTime / 60)} ч ${user.totalAirTime % 60} мин` : '0 ч 0 мин'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Карточка навигации */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                        <Plane className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-gray-800">Управление рейсами</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                      Доступные функции приложения
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                            <Plane className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">Мои рейсы</h3>
                          <p className="text-sm text-gray-500 mb-4">Управление информацией о рейсах</p>
                          <Button
                            onClick={() => router.push('/flights')}
                            className="mt-auto w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Перейти
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="bg-green-100 text-green-700 p-3 rounded-full mb-4">
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">Статистика</h3>
                          <p className="text-sm text-gray-500 mb-4">Анализ ваших перелетов</p>
                          <Button
                            onClick={() => router.push('/statistics')}
                            className="mt-auto w-full bg-green-600 hover:bg-green-700"
                          >
                            Перейти
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="bg-purple-100 text-purple-700 p-3 rounded-full mb-4">
                            <Search className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium text-gray-800 mb-1">Поиск пользователей</h3>
                          <p className="text-sm text-gray-500 mb-4">Сравните статистику с другими</p>
                          <Button
                            onClick={() => router.push('/users')}
                            className="mt-auto w-full bg-purple-600 hover:bg-purple-700"
                          >
                            Перейти
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                        <Info className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-gray-800">Последние действия</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500 py-6">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>История действий будет отображаться здесь</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Пользователь не авторизован
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Левая колонка - информация о приложении */}
              <div className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                        <Plane className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-gray-800">О приложении</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-700 p-2 rounded-full shrink-0">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Храните информацию о рейсах</h3>
                        <p className="text-gray-600">Сохраняйте все детали ваших авиаперелетов в одном месте. Добавляйте информацию вручную или импортируйте из CSV-файла.</p>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 text-green-700 p-2 rounded-full shrink-0">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Анализируйте статистику</h3>
                        <p className="text-gray-600">Получайте наглядную статистику по вашим перелетам. Отслеживайте общее время в воздухе, количество рейсов и другие показатели.</p>
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 text-purple-700 p-2 rounded-full shrink-0">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Сравнивайте с другими</h3>
                        <p className="text-gray-600">Находите других пользователей и сравнивайте вашу статистику. Узнайте, кто летает больше всех!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Правая колонка - авторизация */}
              <div className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 text-green-700 p-2 rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-gray-800">Начните использовать сейчас</CardTitle>
                    </div>
                    <CardDescription className="text-gray-500">
                      Войдите или создайте новый аккаунт
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm">Зарегистрируйтесь, чтобы получить доступ ко всем функциям приложения. Регистрация займет менее минуты.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Link href="/login" className="w-full block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <LogIn className="mr-2 h-5 w-5" />
                          Войти в аккаунт
                        </Button>
                      </Link>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full bg-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-2 text-xs text-gray-500">или</span>
                        </div>
                      </div>

                      <Link href="/register" className="w-full block">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                          <UserPlus className="mr-2 h-5 w-5" />
                          Создать новый аккаунт
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-100 text-amber-700 p-2 rounded-full shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-1">Демо-версия</h3>
                        <p className="text-gray-600 text-sm">Хотите попробовать приложение без регистрации? Используйте демо-аккаунт:</p>
                        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                          <p><span className="text-gray-500">Email:</span> <span className="font-mono">demo@example.com</span></p>
                          <p><span className="text-gray-500">Пароль:</span> <span className="font-mono">demo123</span></p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Нижняя часть */}
        <div className={`mt-16 text-center text-sm text-gray-500 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p>© 2023 FlightRecord. Все права защищены.</p>
        </div>
      </div>
    </main>
  );
}
