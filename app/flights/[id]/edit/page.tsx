"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import ProtectedRoute from "../../../../src/components/ProtectedRoute";
import { Button } from "../../../../src/components/ui/button";
import { useAuth } from "../../../../src/context/AuthContext";
import { Flight } from "../../../../src/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../src/components/ui/form";
import { Input } from "../../../../src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../src/components/ui/card";
import { Loader2 } from "lucide-react";

// Схема валидации формы редактирования рейса
const flightSchema = z.object({
  flight_number: z.string().min(1, {
    message: "Номер рейса обязателен",
  }),
  airline: z.string().min(1, {
    message: "Название авиакомпании обязательно",
  }),
  departure_city: z.string().min(1, {
    message: "Город вылета обязателен",
  }),
  arrival_city: z.string().min(1, {
    message: "Город прилета обязателен",
  }),
  departure_date: z.string().min(1, {
    message: "Дата вылета обязательна",
  }),
  departure_time: z.string().min(1, {
    message: "Время вылета обязательно",
  }),
  arrival_date: z.string().min(1, {
    message: "Дата прилета обязательна",
  }),
  arrival_time: z.string().min(1, {
    message: "Время прилета обязательно",
  }),
  aircraft_type: z.string().optional(),
  seat_number: z.string().optional(),
});

type FlightFormValues = z.infer<typeof flightSchema>;

export default function EditFlightPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Инициализация формы с валидацией
  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flight_number: "",
      airline: "",
      departure_city: "",
      arrival_city: "",
      departure_date: "",
      departure_time: "",
      arrival_date: "",
      arrival_time: "",
      aircraft_type: "",
      seat_number: "",
    },
  });

  // Загрузка данных рейса
  useEffect(() => {
    const loadFlight = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Импортируем функцию для получения рейса из локального хранилища
        const { getLocalFlightById } = await import("../../../../src/lib/local-storage");

        // Получаем рейс из локального хранилища
        const flightData = getLocalFlightById(params.id);

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

        // Форматируем даты для полей формы
        const departure_date = flightData.departure_time_local.toISOString().split('T')[0];
        const departure_time = flightData.departure_time_local.toTimeString().slice(0, 5);
        const arrival_date = flightData.arrival_time_local.toISOString().split('T')[0];
        const arrival_time = flightData.arrival_time_local.toTimeString().slice(0, 5);

        // Заполняем форму данными
        form.reset({
          flight_number: flightData.flight_number,
          airline: flightData.airline,
          departure_city: flightData.departure_city,
          arrival_city: flightData.arrival_city,
          departure_date,
          departure_time,
          arrival_date,
          arrival_time,
          aircraft_type: flightData.aircraft_type || "",
          seat_number: flightData.seat_number || "",
        });
      } catch (error) {
        console.error("Ошибка при загрузке рейса:", error);
        toast.error("Не удалось загрузить данные рейса");
      } finally {
        setLoading(false);
      }
    };

    loadFlight();
  }, [user, params.id, router, form]);

  // Обработчик отправки формы
  async function onSubmit(data: FlightFormValues) {
    if (!user || !flight) return;

    setIsSubmitting(true);

    try {
      // Преобразуем строки даты и времени в объекты Date
      let departure_time_local: Date;
      let arrival_time_local: Date;

      // Если даты не указаны, используем текущую и завтрашнюю
      if (!data.departure_date || !data.departure_time) {
        departure_time_local = new Date();
      } else {
        departure_time_local = new Date(`${data.departure_date}T${data.departure_time}`);
      }

      if (!data.arrival_date || !data.arrival_time) {
        arrival_time_local = new Date(departure_time_local.getTime() + 3600000); // +1 час
      } else {
        arrival_time_local = new Date(`${data.arrival_date}T${data.arrival_time}`);
      }

      // Проверяем валидность дат
      if (isNaN(departure_time_local.getTime())) {
        departure_time_local = new Date();
      }

      if (isNaN(arrival_time_local.getTime())) {
        arrival_time_local = new Date(departure_time_local.getTime() + 3600000); // +1 час
      }

      // Создаем объект с обновленными данными рейса
      const flightData = {
        flight_number: data.flight_number,
        airline: data.airline,
        departure_city: data.departure_city,
        arrival_city: data.arrival_city,
        departure_time_local,
        arrival_time_local,
        aircraft_type: data.aircraft_type || undefined,
        seat_number: data.seat_number || undefined,
      };

      // Импортируем функцию для обновления в локальном хранилище
      const { updateLocalFlight } = await import("../../../../src/lib/local-storage");

      // Обновляем рейс в локальном хранилище
      updateLocalFlight(flight.id!, flightData);

      toast.success("Рейс успешно обновлен");
      router.push(`/flights/${flight.id}`);
    } catch (error) {
      console.error("Ошибка при обновлении рейса:", error);
      toast.error("Не удалось обновить рейс");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Редактирование рейса</h1>
          <Button onClick={() => router.push(`/flights/${params.id}`)}>Назад к рейсу</Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Загрузка данных рейса...</span>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Редактирование рейса</CardTitle>
              <CardDescription>
                Измените информацию о рейсе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="airline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Авиакомпания</FormLabel>
                          <FormControl>
                            <Input placeholder="Аэрофлот" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="flight_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Номер рейса</FormLabel>
                          <FormControl>
                            <Input placeholder="SU1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departure_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Город вылета</FormLabel>
                          <FormControl>
                            <Input placeholder="Москва" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="arrival_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Город прилета</FormLabel>
                          <FormControl>
                            <Input placeholder="Санкт-Петербург" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departure_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дата вылета</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="departure_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Время вылета</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="arrival_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дата прилета</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="arrival_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Время прилета</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="aircraft_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип самолета (необязательно)</FormLabel>
                          <FormControl>
                            <Input placeholder="Boeing 737" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seat_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Номер места (необязательно)</FormLabel>
                          <FormControl>
                            <Input placeholder="12A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/flights/${params.id}`)}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
