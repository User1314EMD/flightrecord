"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ProtectedRoute from "../../src/components/ProtectedRoute";
import { Button } from "../../src/components/ui/button";
import { useAuth } from "../../src/context/AuthContext";
import { User } from "../../src/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../src/components/ui/card";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import { Loader2, Search, User as UserIcon } from "lucide-react";
import UserCard from "../../src/components/users/UserCard";

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Обработчик поиска пользователей
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Введите имя для поиска");
      return;
    }

    setIsSearching(true);

    try {
      // Импортируем функцию для поиска пользователей
      const { searchUsers } = await import("../../src/lib/firebase/users");
      const foundUsers = await searchUsers(searchQuery);
      
      // Исключаем текущего пользователя из результатов
      const filteredUsers = foundUsers.filter(u => u.uid !== user?.uid);
      
      setUsers(filteredUsers);
      
      if (filteredUsers.length === 0) {
        toast.info("Пользователи не найдены");
      }
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      toast.error("Не удалось выполнить поиск");
    } finally {
      setIsSearching(false);
    }
  };

  // Обработчик выбора пользователя для сравнения
  const handleSelectUser = (selectedUser: User) => {
    // Проверяем, выбран ли уже пользователь
    const isAlreadySelected = selectedUsers.some(u => u.uid === selectedUser.uid);
    
    if (isAlreadySelected) {
      // Если пользователь уже выбран, удаляем его из списка
      setSelectedUsers(selectedUsers.filter(u => u.uid !== selectedUser.uid));
    } else {
      // Если пользователь не выбран, добавляем его в список
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
  };

  // Обработчик перехода к сравнению пользователей
  const handleCompare = () => {
    if (selectedUsers.length < 1) {
      toast.error("Выберите хотя бы одного пользователя для сравнения");
      return;
    }

    // Формируем строку с ID выбранных пользователей
    const userIds = selectedUsers.map(u => u.uid).join(",");
    
    // Перенаправляем на страницу сравнения
    router.push(`/users/compare?users=${userIds}`);
  };

  return (
    <ProtectedRoute>
      <main className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Поиск пользователей</h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/flights")}>
              Мои рейсы
            </Button>
            <Button onClick={() => router.push("/")}>
              На главную
            </Button>
          </div>
        </div>

        {/* Форма поиска */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Поиск пользователей</CardTitle>
            <CardDescription>
              Введите имя пользователя для поиска
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="searchQuery" className="sr-only">
                  Поиск по имени
                </Label>
                <Input
                  id="searchQuery"
                  placeholder="Введите имя пользователя"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Найти
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Результаты поиска */}
        {users.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Результаты поиска</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((foundUser) => (
                <UserCard
                  key={foundUser.uid}
                  user={foundUser}
                  isSelected={selectedUsers.some(u => u.uid === foundUser.uid)}
                  onSelect={() => handleSelectUser(foundUser)}
                  onViewProfile={() => router.push(`/users/${foundUser.uid}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Выбранные пользователи для сравнения */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Выбранные пользователи</CardTitle>
              <CardDescription>
                Выбрано пользователей: {selectedUsers.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <div
                    key={selectedUser.uid}
                    className="flex items-center bg-secondary p-2 rounded-md"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{selectedUser.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => handleSelectUser(selectedUser)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCompare}>
                Сравнить пользователей
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </ProtectedRoute>
  );
}
