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

// Схема валидации формы входа
const loginSchema = z.object({
  email: z.string().email({
    message: "Пожалуйста, введите корректный email",
  }),
  password: z.string().min(1, {
    message: "Пожалуйста, введите пароль",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Импортируем контекст аутентификации
import { useAuth } from "../../src/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  // Инициализация формы с валидацией
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Обработчик отправки формы
  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      // Динамический импорт функции аутентификации
      const { signIn } = await import("../../src/lib/firebase/auth");
      await signIn(data.email, data.password);

      // Импортируем функцию для получения пользователя
      const { getCurrentUser } = await import("../../src/lib/firebase/auth");
      const user = await getCurrentUser();

      // Устанавливаем пользователя в контекст
      setUser(user);

      toast.success("Вход выполнен успешно!");

      // Перенаправляем на страницу рейсов
      router.push("/flights");
    } catch (error: any) {
      console.error("Ошибка при входе:", error);

      // Обработка ошибок Firebase
      if (error.code === "auth/invalid-credential") {
        toast.error("Неверный email или пароль");
      } else if (error.code === "auth/user-not-found") {
        toast.error("Пользователь не найден");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Неверный пароль");
      } else {
        toast.error("Ошибка при входе. Пожалуйста, попробуйте снова.");
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
            Вход в аккаунт
          </h1>
          <p className="text-sm text-muted-foreground">
            Введите свои данные для входа
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          Нет аккаунта?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
}
