"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../src/components/ui/form";
import { Input } from "../../../src/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../src/components/ui/card";

// Схема валидации формы добавления рейса
const flightSchema = z.object({
  flight_number: z.string().optional().default("TEST123"),
  airline: z.string().optional().default("Тестовая авиакомпания"),
  departure_city: z.string().optional().default("Москва"),
  arrival_city: z.string().optional().default("Санкт-Петербург"),
  departure_date: z.string().optional().default(""),
  departure_time: z.string().optional().default(""),
  arrival_date: z.string().optional().default(""),
  arrival_time: z.string().optional().default(""),
  aircraft_type: z.string().optional().default("Boeing 737"),
  seat_number: z.string().optional().default("1A"),
});

type FlightFormValues = z.infer<typeof flightSchema>;

export default function AddFlightPage() {
  const router = useRouter();
  const { user } = useAuth();
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

  // Обработчик отправки формы
  async function onSubmit(data: FlightFormValues) {
    if (!user) {
      toast.error("Пользователь не авторизован");
      return;
    }

    setIsSubmitting(true);

    try {
      // Выводим данные формы для отладки
      console.log("Данные формы:", data);

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

      // Временно используем UTC для часовых поясов
      const departure_timezone = "UTC";
      const arrival_timezone = "UTC";

      // Создаем объект рейса
      const flightData = {
        flight_number: data.flight_number || "TEST123",
        airline: data.airline || "Тестовая авиакомпания",
        departure_city: data.departure_city || "Москва",
        arrival_city: data.arrival_city || "Санкт-Петербург",
        departure_time_local,
        departure_timezone,
        arrival_time_local,
        arrival_timezone,
        aircraft_type: data.aircraft_type || "Boeing 737",
        seat_number: data.seat_number || "1A",
        user_id: user.uid,
      };

      console.log("Данные рейса для сохранения:", flightData);

      // Импортируем функцию для добавления в локальное хранилище
      const { addLocalFlight } = await import("../../../src/lib/local-storage");

      // Добавляем рейс в локальное хранилище
      const flightId = addLocalFlight(flightData);
      console.log("Рейс успешно добавлен с ID:", flightId);

      toast.success("Рейс успешно добавлен");
      router.push("/flights");
    } catch (error: any) {
      console.error("Ошибка при добавлении рейса:", error);
      // Показываем более подробную ошибку
      toast.error(`Не удалось добавить рейс: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Добавление рейса</h1>
          <Button onClick={() => router.push("/flights")}>Назад к списку</Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Новый рейс</CardTitle>
            <CardDescription>
              Заполните информацию о рейсе
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

                <div className="flex justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset({
                        flight_number: "TEST123",
                        airline: "Тестовая авиакомпания",
                        departure_city: "Москва",
                        arrival_city: "Санкт-Петербург",
                        departure_date: "",
                        departure_time: "",
                        arrival_date: "",
                        arrival_time: "",
                        aircraft_type: "Boeing 737",
                        seat_number: "1A",
                      });
                    }}
                  >
                    Заполнить тестовыми данными
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/flights")}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Сохранение..." : "Сохранить рейс"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
