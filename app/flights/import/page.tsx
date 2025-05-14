"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../../src/components/ProtectedRoute";
import { Button } from "../../../src/components/ui/button";
import { useAuth } from "../../../src/context/AuthContext";
import { Flight } from "../../../src/types";
import ImportCSV from "../../../src/components/flights/ImportCSV";
import { ArrowLeft, Download } from "lucide-react";

export default function ImportFlightsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [importedFlights, setImportedFlights] = useState<Flight[]>([]);

  // Обработчик завершения импорта
  const handleImportComplete = (flights: Flight[]) => {
    setImportedFlights(flights);
  };

  // Функция для скачивания примера CSV файла
  const downloadSampleCSV = () => {
    // Используем готовый файл из папки public
    const link = document.createElement("a");
    link.setAttribute("href", "/sample_flights.csv");
    link.setAttribute("download", "sample_flights.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Импорт рейсов</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
            >
              <Download className="mr-2 h-4 w-4" /> Скачать пример CSV
            </Button>
            <Button onClick={() => router.push("/flights")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> К списку рейсов
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          <div className="max-w-3xl mx-auto w-full">
            {user && (
              <ImportCSV
                userId={user.uid}
                onImportComplete={handleImportComplete}
              />
            )}
          </div>

          {importedFlights.length > 0 && (
            <div className="mt-8 text-center">
              <Button onClick={() => router.push("/flights")}>
                Перейти к списку рейсов
              </Button>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
