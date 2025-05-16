"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
import { User, Flight } from "../../../src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Импортируем функцию для получения данных пользователя
        const { getUserById, getUserFlights } = await import("../../../src/lib/firebase/users");
        
        // Получаем данные пользователя
        const userData = await getUserById(params.id);
        
        if (!userData) {
          toast.error("Пользователь не найден");
          router.push("/users");
          return;
        }
        
        setUser(userData);
        
        // Получаем рейсы пользователя
        const userFlights = await getUserFlights(params.id);
        setFlights(userFlights);
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
        toast.error("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, params.id, router]);

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
          <h1 className="text-3xl font-bold">Профиль пользователя</h1>
          <Button onClick={() => router.push("/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> К поиску пользователей
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Загрузка данных пользователя...</span>
          </div>
        ) : user ? (
          <div className="space-y-8">
            {/* Карточка пользователя */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="mr-2 h-6 w-6" />
                  {user.name}
                </CardTitle>
                <CardDescription>
                  {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Статистика</h3>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Всего рейсов:</span>
                      <span className="font-medium">{user.totalFlights || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Время в воздухе:</span>
                      <span className="font-medium">{formatAirTime(user.totalAirTime)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => router.push(`/users/compare?users=${params.id}`)}
                  variant="outline"
                >
                  Сравнить с моим профилем
                </Button>
              </CardFooter>
            </Card>

            {/* Список рейсов пользователя */}
            <Card>
              <CardHeader>
                <CardTitle>Рейсы пользователя</CardTitle>
                <CardDescription>
                  Всего рейсов: {flights.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flights.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-lg mb-4">У пользователя пока нет рейсов</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Рейс</TableHead>
                          <TableHead>Маршрут</TableHead>
                          <TableHead>Дата вылета</TableHead>
                          <TableHead>Дата прилета</TableHead>
                          <TableHead>Тип самолета</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flights.map((flight) => (
                          <TableRow key={flight.id}>
                            <TableCell className="font-medium">
                              {flight.airline} {flight.flight_number}
                            </TableCell>
                            <TableCell>
                              {flight.departure_city} → {flight.arrival_city}
                            </TableCell>
                            <TableCell>
                              {flight.departure_time_local.toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>
                              {flight.arrival_time_local.toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>{flight.aircraft_type || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg mb-4">Пользователь не найден</p>
            <Button onClick={() => router.push("/users")}>
              Вернуться к поиску пользователей
            </Button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
