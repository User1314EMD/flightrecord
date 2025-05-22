"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
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
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";

const data = [
  { name: "Москва", value: 24 },
  { name: "Санкт-Петербург", value: 18 },
  { name: "Сочи", value: 12 },
  { name: "Казань", value: 8 }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("cities");

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Статистика полетов</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 gap-2 mb-6">
          <TabsTrigger value="cities">По городам</TabsTrigger>
          <TabsTrigger value="aircraft">По самолетам</TabsTrigger>
        </TabsList>

        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по городам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aircraft">
          <Card>
            <CardHeader>
              <CardTitle>Статистика по самолетам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
