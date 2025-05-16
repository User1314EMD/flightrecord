"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
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
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";

export default function SecurityRulesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isTestingProfiles, setIsTestingProfiles] = useState(false);
  const [isTestingStatistics, setIsTestingStatistics] = useState(false);
  const [profileResults, setProfileResults] = useState<Array<{ test: string; passed: boolean; error?: string }> | null>(null);
  const [statisticsResults, setStatisticsResults] = useState<Array<{ test: string; passed: boolean; error?: string }> | null>(null);

  // Обработчик тестирования правил безопасности для профилей
  const handleTestProfileRules = async () => {
    setIsTestingProfiles(true);
    
    try {
      // Импортируем функцию для тестирования правил безопасности
      const { testProfileSecurityRules } = await import("../../../src/lib/firebase/security-rules-test");
      
      // Запускаем тестирование
      const { success, results } = await testProfileSecurityRules();
      
      // Сохраняем результаты
      setProfileResults(results);
      
      // Показываем уведомление
      if (success) {
        toast.success("Все тесты правил безопасности для профилей пройдены успешно");
      } else {
        toast.error("Некоторые тесты правил безопасности для профилей не пройдены");
      }
    } catch (error) {
      console.error("Ошибка при тестировании правил безопасности для профилей:", error);
      toast.error("Ошибка при тестировании правил безопасности для профилей");
    } finally {
      setIsTestingProfiles(false);
    }
  };

  // Обработчик тестирования правил безопасности для статистики
  const handleTestStatisticsRules = async () => {
    setIsTestingStatistics(true);
    
    try {
      // Импортируем функцию для тестирования правил безопасности
      const { testStatisticsSecurityRules } = await import("../../../src/lib/firebase/security-rules-test");
      
      // Запускаем тестирование
      const { success, results } = await testStatisticsSecurityRules();
      
      // Сохраняем результаты
      setStatisticsResults(results);
      
      // Показываем уведомление
      if (success) {
        toast.success("Все тесты правил безопасности для статистики пройдены успешно");
      } else {
        toast.error("Некоторые тесты правил безопасности для статистики не пройдены");
      }
    } catch (error) {
      console.error("Ошибка при тестировании правил безопасности для статистики:", error);
      toast.error("Ошибка при тестировании правил безопасности для статистики");
    } finally {
      setIsTestingStatistics(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Тестирование правил безопасности</h1>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> На главную
          </Button>
        </div>

        <div className="space-y-8">
          {/* Информация о правилах безопасности */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5" />
                Правила безопасности Firebase
              </CardTitle>
              <CardDescription>
                Тестирование правил безопасности для профилей пользователей и статистики
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Правила безопасности Firebase определяют, кто имеет доступ к данным в Firestore.
                  На этой странице вы можете протестировать правила безопасности для профилей пользователей и статистики.
                </p>
                <div className="bg-secondary p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Основные правила:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Все аутентифицированные пользователи могут читать публичные поля профилей (имя, статистика)</li>
                    <li>Только владелец профиля может читать и изменять приватные поля</li>
                    <li>Все аутентифицированные пользователи могут читать статистику</li>
                    <li>Только владелец может обновлять свою статистику</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={handleTestProfileRules}
                disabled={isTestingProfiles}
              >
                {isTestingProfiles ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Тестирование профилей...
                  </>
                ) : (
                  "Тестировать правила для профилей"
                )}
              </Button>
              <Button
                onClick={handleTestStatisticsRules}
                disabled={isTestingStatistics}
              >
                {isTestingStatistics ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Тестирование статистики...
                  </>
                ) : (
                  "Тестировать правила для статистики"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Результаты тестирования правил для профилей */}
          {profileResults && (
            <Card>
              <CardHeader>
                <CardTitle>Результаты тестирования правил для профилей</CardTitle>
                <CardDescription>
                  {profileResults.every(result => result.passed)
                    ? "Все тесты пройдены успешно"
                    : "Некоторые тесты не пройдены"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тест</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Ошибка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profileResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.test}</TableCell>
                        <TableCell>
                          {result.passed ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Пройден
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <XCircle className="mr-1 h-4 w-4" />
                              Не пройден
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{result.error || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Результаты тестирования правил для статистики */}
          {statisticsResults && (
            <Card>
              <CardHeader>
                <CardTitle>Результаты тестирования правил для статистики</CardTitle>
                <CardDescription>
                  {statisticsResults.every(result => result.passed)
                    ? "Все тесты пройдены успешно"
                    : "Некоторые тесты не пройдены"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тест</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Ошибка</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statisticsResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.test}</TableCell>
                        <TableCell>
                          {result.passed ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Пройден
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600">
                              <XCircle className="mr-1 h-4 w-4" />
                              Не пройден
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{result.error || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
