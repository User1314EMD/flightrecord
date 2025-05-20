"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import { Flight } from "@/src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs";
import { Loader2, BarChart2 } from "lucide-react";
import dynamic from 'next/dynamic';

const ProtectedRouteWrapper = dynamic(
  () => import('@/src/components/ProtectedRoute').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

import ProtectedRoute from "@/src/components/ProtectedRoute";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import { Flight } from "@/src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs";
import { Loader2, BarChart2 } from "lucide-react";

// Цвета для графиков
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

// Colors for charts using CSS variables
const COLORS = [
  "rgb(var(--primary))",
  "rgb(var(--secondary))",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6B66FF"
];

export default function StatisticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Устанавливаем таймаут для загрузки - если загрузка длится более 5 секунд,
    // считаем, что данных нет и показываем соответствующее сообщение
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Таймаут загрузки статистики - прекращаем ожидание");
        setLoadingTimeout(true);
        setLoading(false);
      }
    }, 5000); // 5 секунд таймаут

    return () => clearTimeout(timeoutId);
  }, [loading]);

  useEffect(() => {
    const loadFlights = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setLoadingTimeout(false);
        console.log("Начинаем загрузку данных для статистики...");

        // Импортируем функцию для получения рейсов из Firebase
        const { getLocalUserFlights } = await import("@/src/lib/firebase-adapter");

        try {
          // Получаем рейсы пользователя из Firebase
          console.log("Получаем рейсы пользователя для статистики...");
          const userFlights = await getLocalUserFlights(user.uid);
          console.log(`Получено ${userFlights.length} рейсов для статистики`);

          // Сортируем рейсы по дате вылета (от новых к старым)
          const sortedFlights = [...userFlights].sort(
            (a, b) => b.departure_time_local.getTime() - a.departure_time_local.getTime()
          );

          setFlights(sortedFlights);
        } catch (firebaseError) {
          console.error("Ошибка при работе с Firebase:", firebaseError);
          // Если Firebase не работает, устанавливаем пустой массив
          setFlights([]);
          toast.error("Не удалось получить данные из Firebase");
        }
      } catch (error) {
        console.error("Ошибка при загрузке рейсов:", error);
        toast.error("Не удалось загрузить данные рейсов");
        // В случае ошибки устанавливаем пустой массив, чтобы не показывать загрузку бесконечно
        setFlights([]);
      } finally {
        // В любом случае завершаем загрузку
        console.log("Загрузка данных для статистики завершена");
        setLoading(false);
      }
    };

    // Запускаем загрузку данных
    loadFlights();
  }, [user]);

  // Функция для расчета общего времени в воздухе (в минутах)
  const calculateTotalAirTime = (): number => {
    return flights.reduce((total, flight) => {
      const departureTime = flight.departure_time_local.getTime();
      const arrivalTime = flight.arrival_time_local.getTime();
      const flightDurationMinutes = Math.round((arrivalTime - departureTime) / (1000 * 60));
      return total + flightDurationMinutes;
    }, 0);
  };

  // Форматирование времени в воздухе
  const formatAirTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours} ч ${mins} мин`;
  };

  // Данные для графика по авиакомпаниям
  const getAirlineData = () => {
    const airlineCounts: Record<string, number> = {};

    flights.forEach(flight => {
      const airline = flight.airline;
      airlineCounts[airline] = (airlineCounts[airline] || 0) + 1;
    });

    return Object.entries(airlineCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Данные для графика по городам вылета
  const getDepartureCityData = () => {
    const cityCounts: Record<string, number> = {};

    flights.forEach(flight => {
      const city = flight.departure_city;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Данные для графика по городам прилета
  const getArrivalCityData = () => {
    const cityCounts: Record<string, number> = {};

    flights.forEach(flight => {
      const city = flight.arrival_city;
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    return Object.entries(cityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Данные для графика по типам самолетов
  const getAircraftTypeData = () => {
    const typeCounts: Record<string, number> = {};

    flights.forEach(flight => {
      const type = flight.aircraft_type || "Неизвестно";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Данные для графика по месяцам
  const getMonthlyData = () => {
    const monthCounts: Record<string, number> = {};
    const monthNames = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    flights.forEach(flight => {
      const date = flight.departure_time_local;
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
    });

    // Сортируем по дате
    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');

      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }

      return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
    });

    return sortedMonths.map(month => ({
      name: month,
      flights: monthCounts[month]
    }));
  };

  // Данные для графика маршрутов
  const getRouteData = () => {
    const routeCounts: Record<string, number> = {};

    flights.forEach(flight => {
      const route = `${flight.departure_city} → ${flight.arrival_city}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    return Object.entries(routeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Топ-10 маршрутов
  };

  // Кастомный тултип для графиков
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedRoute>
      <motion.main
        className="container mx-auto py-10 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Статистика полетов</h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/flights")}>
              Мои рейсы
            </Button>
            <Button onClick={() => router.push("/")}>
              На главную
            </Button>
          </div>
        </div>

        {loading ? (
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Загрузка данных...</span>
          </motion.div>
        ) : loadingTimeout ? (
          <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
              <CardTitle>Не удалось загрузить данные</CardTitle>
              <CardDescription>
                Возможно, проблемы с подключением к Firebase
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Попробуйте обновить страницу</p>
              <Button onClick={() => window.location.reload()}>
                Обновить страницу
              </Button>
            </CardContent>
          </Card>
          </motion.div>
          </motion.div>
          </motion.div>
          </motion.div>
        ) : flights.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card>
            <CardHeader>
              <CardTitle>Нет данных</CardTitle>
              <CardDescription>
                У вас пока нет рейсов для отображения статистики
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Добавьте рейсы, чтобы увидеть статистику</p>
              <Button onClick={() => router.push("/flights/add")}>
                Добавить рейс
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div variants={containerVariants} className="space-y-8">
            {/* Общая статистика */}
            <motion.div variants={itemVariants}>
              <Card>
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
                <CardDescription>
                  Сводная информация о ваших полетах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Всего рейсов</h3>
                    <p className="text-3xl font-bold">{flights.length}</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Время в воздухе</h3>
                    <p className="text-3xl font-bold">{formatAirTime(calculateTotalAirTime())}</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Уникальных маршрутов</h3>
                    <p className="text-3xl font-bold">{getRouteData().length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Графики */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="airlines">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-4">
                <TabsTrigger value="airlines">Авиакомпании</TabsTrigger>
                <TabsTrigger value="routes">Маршруты</TabsTrigger>
                <TabsTrigger value="cities">Города</TabsTrigger>
                <TabsTrigger value="aircraft">Самолеты</TabsTrigger>
                <TabsTrigger value="monthly">По месяцам</TabsTrigger>
                <TabsTrigger value="timeline">Таймлайн</TabsTrigger>
              </TabsList>

              {/* График по авиакомпаниям */}
              <TabsContent value="airlines">
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по авиакомпаниям</CardTitle>
                    <CardDescription>
                      Количество рейсов по авиакомпаниям
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getAirlineData()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getAirlineData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* График по маршрутам */}
              <TabsContent value="routes">
                <Card>
                  <CardHeader>
                    <CardTitle>Топ маршрутов</CardTitle>
                    <CardDescription>
                      Наиболее частые маршруты полетов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getRouteData()}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="value" name="Количество рейсов" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* График по городам */}
              <TabsContent value="cities">
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по городам</CardTitle>
                    <CardDescription>
                      Количество рейсов по городам вылета и прилета
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-center">Города вылета</h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getDepartureCityData()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {getDepartureCityData().map((entry, index) => (
                                  <Cell key={`cell-dep-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-4 text-center">Города прилета</h3>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getArrivalCityData()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {getArrivalCityData().map((entry, index) => (
                                  <Cell key={`cell-arr-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* График по типам самолетов */}
              <TabsContent value="aircraft">
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по типам самолетов</CardTitle>
                    <CardDescription>
                      Количество рейсов по типам воздушных судов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getAircraftTypeData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="value" name="Количество рейсов" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* График по месяцам */}
              <TabsContent value="monthly">
                <Card>
                  <CardHeader>
                    <CardTitle>Распределение по месяцам</CardTitle>
                    <CardDescription>
                      Количество рейсов по месяцам
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getMonthlyData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="flights" name="Количество рейсов" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Таймлайн рейсов */}
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Таймлайн рейсов</CardTitle>
                    <CardDescription>
                      Хронология ваших полетов
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {flights.map((flight, index) => (
                        <div
                          key={flight.id || index}
                          className="border-l-4 border-primary pl-4 pb-4 relative"
                        >
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1.5"></div>
                          <div className="text-sm text-muted-foreground">
                            {flight.departure_time_local.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="font-medium">
                            {flight.airline} {flight.flight_number}
                          </div>
                          <div>
                            {flight.departure_city} → {flight.arrival_city}
                          </div>
                          <div className="text-sm">
                            {flight.aircraft_type || "Неизвестный тип самолета"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          </motion.div>
          </div>
        )}
      </motion.main>
    </ProtectedRoute>
  );
}
