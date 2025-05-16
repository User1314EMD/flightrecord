"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import dynamic from 'next/dynamic';

// Динамический импорт компонентов UI
const Form = dynamic(() => import("../../src/components/ui/form").then(mod => mod.Form), { ssr: false });
const FormControl = dynamic(() => import("../../src/components/ui/form").then(mod => mod.FormControl), { ssr: false });
const FormField = dynamic(() => import("../../src/components/ui/form").then(mod => mod.FormField), { ssr: false });
const FormItem = dynamic(() => import("../../src/components/ui/form").then(mod => mod.FormItem), { ssr: false });
const FormLabel = dynamic(() => import("../../src/components/ui/form").then(mod => mod.FormLabel), { ssr: false });
const FormMessage = dynamic(() => import("../../src/components/ui/form").then(mod => mod.FormMessage), { ssr: false });
const Input = dynamic(() => import("../../src/components/ui/input").then(mod => mod.Input), { ssr: false });
const Button = dynamic(() => import("../../src/components/ui/button").then(mod => mod.Button), { ssr: false });

// Схема валидации формы регистрации
const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов",
  }),
  email: z.string().email({
    message: "Пожалуйста, введите корректный email",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать не менее 6 символов",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Импортируем контекст аутентификации
import { useAuth } from "../../src/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  // Инициализация формы с валидацией
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Обработчик отправки формы
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // Динамический импорт функции регистрации
      const { registerUser } = await import("../../src/lib/firebase/auth");
      await registerUser(data.email, data.password, data.name);

      // Импортируем функцию для получения пользователя
      const { getCurrentUser } = await import("../../src/lib/firebase/auth");
      const user = await getCurrentUser();

      // Устанавливаем пользователя в контекст
      setUser(user);

      toast.success("Регистрация успешна!");

      // Перенаправляем на страницу рейсов
      router.push("/flights");
    } catch (error: any) {
      console.error("Ошибка при регистрации:", error);

      // Обработка ошибок Firebase
      if (error.code === "auth/email-already-in-use") {
        toast.error("Этот email уже используется");
      } else {
        toast.error("Ошибка при регистрации. Пожалуйста, попробуйте снова.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Создайте аккаунт
          </h1>
          <p className="text-sm text-muted-foreground">
            Введите свои данные для регистрации
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Иванов" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
