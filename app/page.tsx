export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Добро пожаловать в FlightRecord
        </h1>
        <p className="text-xl mb-8 text-center">
          Приложение для хранения и обмена информацией о рейсах
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Войти
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Зарегистрироваться
          </a>
        </div>
      </div>
    </main>
  );
}
