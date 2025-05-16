# Настройка Firebase для проекта FlightRecord

Этот документ содержит инструкции по настройке Firebase для проекта FlightRecord.

## Предварительные требования

1. Аккаунт Google
2. Node.js и npm/yarn/pnpm
3. Firebase CLI (`npm install -g firebase-tools`)

## Шаги по настройке

### 1. Создание проекта Firebase

1. Перейдите на [console.firebase.google.com](https://console.firebase.google.com/)
2. Нажмите "Добавить проект"
3. Введите имя проекта (например, "flightrec")
4. Следуйте инструкциям по созданию проекта

### 2. Настройка аутентификации

1. В консоли Firebase перейдите в раздел "Authentication"
2. Нажмите "Начать работу"
3. Включите метод "Email/Password"
4. Сохраните изменения

### 3. Настройка Firestore

1. В консоли Firebase перейдите в раздел "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите режим "Начать в тестовом режиме"
4. Выберите ближайший к вам регион
5. Нажмите "Включить"

### 4. Настройка правил безопасности Firestore

1. В консоли Firebase перейдите в раздел "Firestore Database" -> "Правила"
2. Замените правила на содержимое файла `firestore.rules` из проекта
3. Нажмите "Опубликовать"

### 5. Настройка индексов Firestore

1. В консоли Firebase перейдите в раздел "Firestore Database" -> "Индексы"
2. Создайте составной индекс:
   - Коллекция: `flights`
   - Поля: `user_id` (по возрастанию), `departure_time_local` (по убыванию)
   - Область запроса: `Collection`
3. Нажмите "Создать индекс"

### 6. Настройка проекта веб-приложения

1. В консоли Firebase перейдите в раздел "Project Overview"
2. Нажмите на иконку веб-приложения (</>) для добавления веб-приложения
3. Введите имя приложения (например, "FlightRecord Web")
4. Нажмите "Зарегистрировать приложение"
5. Скопируйте конфигурацию Firebase

### 7. Настройка переменных окружения

1. Создайте файл `.env.local` в корне проекта (если он еще не создан)
2. Добавьте следующие переменные окружения:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="ваш_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="ваш_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="ваш_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="ваш_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="ваш_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="ваш_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="ваш_measurement_id"
```

### 8. Загрузка правил безопасности

Для загрузки правил безопасности Firestore выполните следующие команды:

```bash
# Авторизация в Firebase
firebase login

# Выбор проекта
firebase use --add

# Загрузка правил безопасности
node deploy-firestore-rules.js
```

## Структура данных Firestore

### Коллекция `users`

Содержит профили пользователей:

```
users/{userId}
  - email: string
  - name: string
  - totalFlights: number
  - totalAirTime: number
  - created_at: timestamp
  - updated_at: timestamp
```

### Коллекция `flights`

Содержит информацию о рейсах:

```
flights/{flightId}
  - flight_number: string
  - airline: string
  - departure_city: string
  - arrival_city: string
  - departure_time_local: timestamp
  - departure_timezone: string
  - arrival_time_local: timestamp
  - arrival_timezone: string
  - aircraft_type: string (optional)
  - seat_number: string (optional)
  - user_id: string
  - created_at: timestamp
  - updated_at: timestamp
```

### Коллекция `statistics`

Содержит статистику пользователей:

```
statistics/{userId}
  - totalFlights: number
  - totalAirTime: number
  - updated_at: timestamp
```

### Коллекция `aggregatedStats`

Содержит агрегированную статистику:

```
aggregatedStats/global
  - totalUsers: number
  - totalFlights: number
  - totalAirTime: number
  - updated_at: timestamp
```

## Дополнительные ресурсы

- [Документация Firebase](https://firebase.google.com/docs)
- [Документация Firestore](https://firebase.google.com/docs/firestore)
- [Документация Firebase Authentication](https://firebase.google.com/docs/auth)
- [Документация Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
