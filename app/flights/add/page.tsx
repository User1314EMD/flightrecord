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
import { Separator } from "../../../src/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../../../src/components/ui/alert";
import { InfoIcon, SearchIcon, LoaderIcon } from "lucide-react";

// Схема валидации формы поиска рейса
const flightLookupSchema = z.object({
  lookup_flight_number: z.string().min(2, "Введите номер рейса"),
  lookup_date: z.string().optional(),
});

type FlightLookupFormValues = z.infer<typeof flightLookupSchema>;

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
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Инициализация формы поиска рейса
  const lookupForm = useForm<FlightLookupFormValues>({
    resolver: zodResolver(flightLookupSchema),
    defaultValues: {
      lookup_flight_number: "",
      lookup_date: new Date().toISOString().split('T')[0],
    },
  });

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

  // Функция для поиска информации о рейсе
  async function onLookup(data: FlightLookupFormValues) {
    setIsLookingUp(true);
    setLookupError(null);

    try {
      console.log('Отправка запроса на поиск рейса:', data);

      // Формируем URL для запроса
      const url = new URL('/api/flightradar', window.location.origin);
      url.searchParams.append('flight_number', data.lookup_flight_number);

      if (data.lookup_date) {
        url.searchParams.append('date', data.lookup_date);
      }

      console.log('URL запроса:', url.toString());

      // Отправляем запрос к API
      const response = await fetch(url.toString());
      console.log('Получен ответ от API:', response.status, response.statusText);

      // Получаем тело ответа
      const responseText = await response.text();
      console.log('Тело ответа (первые 100 символов):', responseText.substring(0, 100));

      // Парсим JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Ошибка при парсинге JSON:', e);
        throw new Error(`Некорректный формат ответа: ${responseText.substring(0, 100)}...`);
      }

      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(responseData.error || `Ошибка API: ${response.status} ${response.statusText}`);
      }

      // Проверяем наличие ошибки в ответе
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      // Получаем данные о рейсе
      const flightInfo = responseData;
      console.log('Получены данные о рейсе:', flightInfo);

      // Заполняем форму данными о рейсе
      form.setValue('flight_number', flightInfo.flight_number || '');
      form.setValue('airline', flightInfo.airline || '');
      form.setValue('departure_city', flightInfo.departure_city || '');
      form.setValue('arrival_city', flightInfo.arrival_city || '');
      form.setValue('departure_date', flightInfo.departure_date || '');
      form.setValue('departure_time', flightInfo.departure_time || '');
      form.setValue('arrival_date', flightInfo.arrival_date || '');
      form.setValue('arrival_time', flightInfo.arrival_time || '');
      form.setValue('aircraft_type', flightInfo.aircraft_type || '');

      toast.success('Информация о рейсе успешно получена');
    } catch (error: any) {
      console.error('Ошибка при получении информации о рейсе:', error);
      const errorMessage = error.message || 'Не удалось получить информацию о рейсе';
      setLookupError(errorMessage);
      toast.error(`Ошибка: ${errorMessage}`);
    } finally {
      setIsLookingUp(false);
    }
  }

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
        try {
          departure_time_local = new Date(`${data.departure_date}T${data.departure_time}`);
          if (isNaN(departure_time_local.getTime())) {
            console.warn("Некорректная дата вылета, используем текущую дату");
            departure_time_local = new Date();
          }
        } catch (e) {
          console.warn("Ошибка при парсинге даты вылета:", e);
          departure_time_local = new Date();
        }
      }

      if (!data.arrival_date || !data.arrival_time) {
        arrival_time_local = new Date(departure_time_local.getTime() + 3600000); // +1 час
      } else {
        try {
          arrival_time_local = new Date(`${data.arrival_date}T${data.arrival_time}`);
          if (isNaN(arrival_time_local.getTime())) {
            console.warn("Некорректная дата прилета, используем дату вылета + 1 час");
            arrival_time_local = new Date(departure_time_local.getTime() + 3600000);
          }
        } catch (e) {
          console.warn("Ошибка при парсинге даты прилета:", e);
          arrival_time_local = new Date(departure_time_local.getTime() + 3600000);
        }
      }

      // Временно используем UTC для часовых поясов
      const departure_timezone = "UTC";
      const arrival_timezone = "UTC";

      // Создаем объект рейса с проверкой на пустые значения
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

      try {
        // Импортируем функции для работы с Firebase
        const { addLocalFlight } = await import("../../../src/lib/firebase-adapter");
        const { checkFirebaseConnection } = await import("../../../src/lib/firebase/config");

        // Проверяем подключение к Firebase
        console.log("Проверяем подключение к Firebase...");
        const isConnected = await checkFirebaseConnection();

        if (isConnected) {
          console.log("Firebase доступен, добавляем рейс...");

          // Добавляем рейс в Firebase
          const flightId = await addLocalFlight(flightData);

          // Проверяем, является ли ID локальным (если Firebase недоступен)
          if (flightId.startsWith("local_")) {
            console.log("Рейс сохранен локально с ID:", flightId);
            toast.success("Рейс сохранен локально (Firebase недоступен)");
          } else {
            console.log("Рейс успешно добавлен в Firebase с ID:", flightId);
            toast.success("Рейс успешно добавлен");
          }

          // Перенаправляем на страницу рейсов
          router.push("/flights");
        } else {
          console.warn("Firebase недоступен, сохраняем рейс локально...");

          // Генерируем локальный ID
          const localId = "local_" + Math.random().toString(36).substring(2, 15);
          console.log("Сохраняем рейс локально с ID:", localId);

          // Сохраняем рейс в localStorage
          try {
            const localFlights = JSON.parse(localStorage.getItem("localFlights") || "[]");
            localFlights.push({
              ...flightData,
              id: localId,
              created_at: new Date(),
              updated_at: new Date()
            });
            localStorage.setItem("localFlights", JSON.stringify(localFlights));

            toast.warning("Firebase недоступен. Рейс сохранен локально.");

            // Перенаправляем на страницу рейсов
            router.push("/flights");
          } catch (localStorageError) {
            console.error("Ошибка при сохранении в localStorage:", localStorageError);
            toast.error("Не удалось сохранить рейс локально.");
          }
        }
      } catch (firebaseError: any) {
        console.error("Ошибка при работе с Firebase:", firebaseError);

        // Пытаемся сохранить рейс локально как запасной вариант
        try {
          // Генерируем локальный ID
          const localId = "local_" + Math.random().toString(36).substring(2, 15);
          console.log("Сохраняем рейс локально с ID:", localId);

          // Сохраняем рейс в localStorage
          const localFlights = JSON.parse(localStorage.getItem("localFlights") || "[]");
          localFlights.push({
            ...flightData,
            id: localId,
            created_at: new Date(),
            updated_at: new Date()
          });
          localStorage.setItem("localFlights", JSON.stringify(localFlights));

          toast.warning("Ошибка Firebase. Рейс сохранен локально.");

          // Перенаправляем на страницу рейсов
          router.push("/flights");
        } catch (localError) {
          console.error("Ошибка при локальном сохранении:", localError);
          toast.error("Не удалось сохранить рейс ни в Firebase, ни локально.");
        }
      }
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

        <Card className="max-w-2xl mx-auto mb-6">
          <CardHeader>
            <CardTitle>Быстрый поиск рейса</CardTitle>
            <CardDescription>
              Введите номер рейса и дату для автоматического заполнения данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...lookupForm}>
              <form onSubmit={lookupForm.handleSubmit(onLookup)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={lookupForm.control}
                    name="lookup_flight_number"
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

                  <FormField
                    control={lookupForm.control}
                    name="lookup_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата рейса</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {lookupError && (
                  <Alert variant="destructive" className="mt-4">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{lookupError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLookingUp}>
                    {isLookingUp ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Поиск...
                      </>
                    ) : (
                      <>
                        <SearchIcon className="mr-2 h-4 w-4" />
                        Найти рейс
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Новый рейс</CardTitle>
            <CardDescription>
              Заполните информацию о рейсе или используйте быстрый поиск выше
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
                      {isSubmitting ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        "Сохранить рейс"
                      )}
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
