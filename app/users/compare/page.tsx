"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
import { User } from "../../../src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../../src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../../src/components/ui/table";
import { ArrowLeft, Loader2, User as UserIcon } from "lucide-react";

export default function CompareUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Получаем ID пользователей из параметров URL
        const userIds = searchParams.get("users")?.split(",") || [];
        
        if (userIds.length === 0) {
          toast.error("Не указаны пользователи для сравнения");
          router.push("/users");
          return;
        }

        // Импортируем функцию для получения данных пользователей
        const { getUserById } = await import("../../../src/lib/firebase/users");
        
        // Загружаем данные текущего пользователя
        const currentUserData = await getUserById(currentUser.uid);
        
        if (!currentUserData) {
          toast.error("Не удалось загрузить данные вашего профиля");
          return;
        }
        
        // Загружаем данные выбранных пользователей
        const usersData: User[] = [currentUserData];
        
        for (const userId of userIds) {
          // Пропускаем текущего пользователя, если он уже в списке
          if (userId === currentUser.uid) continue;
          
          const userData = await getUserById(userId);
          
          if (userData) {
            usersData.push(userData);
          }
        }
        
        setUsers(usersData);
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователей:", error);
        toast.error("Не удалось загрузить данные пользователей");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentUser, searchParams, router]);

  // Форматирование времени в воздухе
  const formatAirTime = (minutes?: number): string => {
    if (!minutes) return "0 ч 0 мин";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours} ч ${mins} мин`;
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Сравнение пользователей</h1>
          <Button onClick={() => router.push("/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> К поиску пользователей
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Загрузка данных пользователей...</span>
          </div>
        ) : users.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Сравнение статистики</CardTitle>
              <CardDescription>
                Сравнение статистики {users.length} пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Всего рейсов</TableHead>
                      <TableHead>Время в воздухе</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            {user.name}
                            {user.uid === currentUser?.uid && (
                              <span className="ml-2 text-xs text-muted-foreground">(вы)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.totalFlights || 0}</TableCell>
                        <TableCell>{formatAirTime(user.totalAirTime)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/users/${user.uid}`)}
                          >
                            Профиль
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Визуальное сравнение */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Визуальное сравнение</h3>
                
                {/* Сравнение количества рейсов */}
                <div className="mb-6">
                  <h4 className="text-md font-medium mb-2">Количество рейсов</h4>
                  <div className="space-y-2">
                    {users.map((user) => {
                      // Находим максимальное количество рейсов для масштабирования
                      const maxFlights = Math.max(...users.map(u => u.totalFlights || 0));
                      // Вычисляем процент для ширины прогресс-бара
                      const percentage = maxFlights > 0 
                        ? ((user.totalFlights || 0) / maxFlights) * 100 
                        : 0;
                      
                      return (
                        <div key={`flights-${user.uid}`} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{user.name}</span>
                            <span>{user.totalFlights || 0}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Сравнение времени в воздухе */}
                <div>
                  <h4 className="text-md font-medium mb-2">Время в воздухе</h4>
                  <div className="space-y-2">
                    {users.map((user) => {
                      // Находим максимальное время в воздухе для масштабирования
                      const maxAirTime = Math.max(...users.map(u => u.totalAirTime || 0));
                      // Вычисляем процент для ширины прогресс-бара
                      const percentage = maxAirTime > 0 
                        ? ((user.totalAirTime || 0) / maxAirTime) * 100 
                        : 0;
                      
                      return (
                        <div key={`airtime-${user.uid}`} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{user.name}</span>
                            <span>{formatAirTime(user.totalAirTime)}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg mb-4">Нет данных для сравнения</p>
            <Button onClick={() => router.push("/users")}>
              Вернуться к поиску пользователей
            </Button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
