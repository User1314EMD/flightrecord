"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import { Button } from "../../src/components/ui/button";
import { useAuth } from "../../src/context/AuthContext";
import { Flight } from "../../src/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../src/components/ui/card";
import { PlusCircle, Loader2, Upload, User as UserIcon, BarChart2 } from "lucide-react";
import FlightFilters from "../../src/components/flights/FlightFilters";

export default function FlightsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlights = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Импортируем функции для работы с Firebase
        const { getLocalUserFlights, initializeTestData } = await import("../../src/lib/firebase-adapter");

        // Инициализируем тестовые данные, если нет рейсов
        await initializeTestData(user.uid);

        // Получаем рейсы из Firebase
        const userFlights = await getLocalUserFlights(user.uid);
        setFlights(userFlights);
        setFilteredFlights(userFlights);
      } catch (error) {
        console.error("Ошибка при загрузке рейсов:", error);
        toast.error("Не удалось загрузить рейсы");
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [user]);

  // Обработчик изменения фильтров - используем useCallback для стабильности ссылки
  const handleFilterChange = useCallback((newFilteredFlights: Flight[]) => {
    setFilteredFlights(newFilteredFlights);
  }, []);

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот рейс?")) return;

    try {
      // Импортируем функцию для удаления из Firebase
      const { deleteLocalFlight } = await import("../../src/lib/firebase-adapter");

      // Удаляем рейс из Firebase
      await deleteLocalFlight(flightId);

      // Обновляем состояние
      setFlights(flights.filter(flight => flight.id !== flightId));
      setFilteredFlights(filteredFlights.filter(flight => flight.id !== flightId));

      toast.success("Рейс успешно удален");
    } catch (error) {
      console.error("Ошибка при удалении рейса:", error);
      toast.error("Не удалось удалить рейс");
    }
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Мои рейсы</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/flights/add")}
              className="bg-green-600 hover:bg-green-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Добавить рейс
            </Button>
            <Button
              onClick={() => router.push("/flights/import")}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" /> Импорт из CSV
            </Button>
            <Button
              onClick={() => router.push("/statistics")}
              className="bg-green-600 hover:bg-green-700"
            >
              <BarChart2 className="mr-2 h-4 w-4" /> Статистика
            </Button>
            <Button
              onClick={() => router.push("/users")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <UserIcon className="mr-2 h-4 w-4" /> Поиск пользователей
            </Button>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>

        {/* Компонент фильтрации */}
        <FlightFilters
          flights={flights}
          onFilterChange={handleFilterChange}
        />

        <Card>
          <CardHeader>
            <CardTitle>Список рейсов</CardTitle>
            <CardDescription>
              Всего рейсов: {loading ? "..." : filteredFlights.length} {filteredFlights.length !== flights.length && `(отфильтровано из ${flights.length})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Загрузка рейсов...</span>
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-lg mb-4">У вас пока нет добавленных рейсов</p>
                <Button
                  onClick={() => router.push("/flights/add")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Добавить первый рейс
                </Button>
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-lg mb-4">Нет рейсов, соответствующих фильтрам</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Сбрасываем фильтры, показывая все рейсы
                    handleFilterChange(flights);
                  }}
                >
                  Сбросить фильтры
                </Button>
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
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlights.map((flight) => (
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/flights/${flight.id}`)}
                            >
                              Просмотр
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/flights/${flight.id}/edit`)}
                            >
                              Изменить
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteFlight(flight.id!)}
                            >
                              Удалить
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
