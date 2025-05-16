"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
import { Flight } from "../../../src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";
import { Loader2, Pencil, Trash, ArrowLeft } from "lucide-react";

export default function FlightDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFlight = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Импортируем функцию для получения рейса из Firebase
        const { getLocalFlightById } = await import("../../../src/lib/firebase-adapter");

        // Получаем рейс из Firebase
        const flightData = await getLocalFlightById(params.id);

        if (!flightData) {
          toast.error("Рейс не найден");
          router.push("/flights");
          return;
        }

        // Проверяем, принадлежит ли рейс текущему пользователю
        if (flightData.user_id !== user.uid) {
          toast.error("У вас нет доступа к этому рейсу");
          router.push("/flights");
          return;
        }

        setFlight(flightData);
      } catch (error) {
        console.error("Ошибка при загрузке рейса:", error);
        toast.error("Не удалось загрузить данные рейса");
      } finally {
        setLoading(false);
      }
    };

    loadFlight();
  }, [user, params.id, router]);

  const handleDeleteFlight = async () => {
    if (!flight) return;

    if (!confirm("Вы уверены, что хотите удалить этот рейс?")) return;

    try {
      // Импортируем функцию для удаления из Firebase
      const { deleteLocalFlight } = await import("../../../src/lib/firebase-adapter");

      // Удаляем рейс из Firebase
      await deleteLocalFlight(flight.id!);

      toast.success("Рейс успешно удален");
      router.push("/flights");
    } catch (error) {
      console.error("Ошибка при удалении рейса:", error);
      toast.error("Не удалось удалить рейс");
    }
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Детали рейса</h1>
          <Button onClick={() => router.push("/flights")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> К списку рейсов
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Загрузка данных рейса...</span>
          </div>
        ) : flight ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {flight.airline} {flight.flight_number}
              </CardTitle>
              <CardDescription>
                {flight.departure_time_local.toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Маршрут</h3>
                  <p className="text-lg font-medium mt-1">
                    {flight.departure_city} → {flight.arrival_city}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Авиакомпания</h3>
                  <p className="text-lg font-medium mt-1">{flight.airline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Вылет</h3>
                  <p className="text-lg font-medium mt-1">
                    {flight.departure_time_local.toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.departure_city} ({flight.departure_timezone})
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Прилет</h3>
                  <p className="text-lg font-medium mt-1">
                    {flight.arrival_time_local.toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.arrival_city} ({flight.arrival_timezone})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Тип самолета</h3>
                  <p className="text-lg font-medium mt-1">
                    {flight.aircraft_type || "Не указан"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Место</h3>
                  <p className="text-lg font-medium mt-1">
                    {flight.seat_number || "Не указано"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Время в пути</h3>
                <p className="text-lg font-medium mt-1">
                  {calculateFlightDuration(flight.departure_time_local, flight.arrival_time_local)}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/flights/${flight.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Редактировать
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteFlight}
              >
                <Trash className="mr-2 h-4 w-4" /> Удалить
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-10">
            <p className="text-lg mb-4">Рейс не найден</p>
            <Button onClick={() => router.push("/flights")}>
              Вернуться к списку рейсов
            </Button>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

// Функция для расчета времени в пути
function calculateFlightDuration(departure: Date, arrival: Date): string {
  const durationMs = arrival.getTime() - departure.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return `${hours} ч ${minutes} мин`;
}
