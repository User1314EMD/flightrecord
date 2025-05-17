/**
 * API-route для получения информации о рейсе из OpenSky Network API
 */
import { NextRequest, NextResponse } from 'next/server';

// Конфигурация API
const OPENSKY_API_URL = 'https://opensky-network.org/api';
const OPENSKY_USERNAME = process.env.OPENSKY_USERNAME || '';
const OPENSKY_PASSWORD = process.env.OPENSKY_PASSWORD || '';

// Аэропорты для демонстрации (в реальном приложении это должно быть в базе данных)
const AIRPORTS: Record<string, { name: string, icao: string, iata: string }> = {
  'UUEE': { name: 'Шереметьево', icao: 'UUEE', iata: 'SVO' },
  'UUDD': { name: 'Домодедово', icao: 'UUDD', iata: 'DME' },
  'UUWW': { name: 'Внуково', icao: 'UUWW', iata: 'VKO' },
  'LEMD': { name: 'Мадрид Барахас', icao: 'LEMD', iata: 'MAD' },
  'EGLL': { name: 'Лондон Хитроу', icao: 'EGLL', iata: 'LHR' },
  'LFPG': { name: 'Париж Шарль-де-Голль', icao: 'LFPG', iata: 'CDG' },
  'EDDF': { name: 'Франкфурт', icao: 'EDDF', iata: 'FRA' },
  'EHAM': { name: 'Амстердам Схипхол', icao: 'EHAM', iata: 'AMS' },
};

// Авиакомпании для демонстрации
const AIRLINES: Record<string, { name: string, icao: string, iata: string }> = {
  'AFL': { name: 'Аэрофлот', icao: 'AFL', iata: 'SU' },
  'SBI': { name: 'S7 Airlines', icao: 'SBI', iata: 'S7' },
  'BAW': { name: 'British Airways', icao: 'BAW', iata: 'BA' },
  'AFR': { name: 'Air France', icao: 'AFR', iata: 'AF' },
  'DLH': { name: 'Lufthansa', icao: 'DLH', iata: 'LH' },
  'KLM': { name: 'KLM', icao: 'KLM', iata: 'KL' },
};

/**
 * Преобразует ICAO код авиакомпании в IATA код
 * @param icaoCode ICAO код авиакомпании
 * @returns IATA код авиакомпании или пустую строку
 */
function getAirlineIataCode(icaoCode: string): string {
  const airline = Object.values(AIRLINES).find(a => a.icao === icaoCode);
  return airline?.iata || '';
}

/**
 * Преобразует ICAO код аэропорта в название города
 * @param icaoCode ICAO код аэропорта
 * @returns Название города или ICAO код, если город не найден
 */
function getAirportName(icaoCode: string): string {
  return AIRPORTS[icaoCode]?.name || icaoCode;
}

/**
 * Преобразует позывной в номер рейса
 * @param callsign Позывной (например, "AFL1234")
 * @returns Номер рейса в формате IATA (например, "SU1234")
 */
function callsignToFlightNumber(callsign: string): string {
  if (!callsign) return '';

  // Извлекаем код авиакомпании (первые 3 символа)
  const airlineCode = callsign.substring(0, 3);

  // Извлекаем номер рейса (остальные символы)
  const flightNumber = callsign.substring(3);

  // Преобразуем ICAO код авиакомпании в IATA код
  const iataCode = getAirlineIataCode(airlineCode);

  // Если IATA код найден, возвращаем номер рейса в формате IATA
  if (iataCode) {
    return `${iataCode}${flightNumber}`;
  }

  // Иначе возвращаем исходный позывной
  return callsign;
}

/**
 * Генерирует моковые данные о рейсе для демонстрации
 * @param flightNumber Номер рейса
 * @param date Дата рейса
 * @returns Моковые данные о рейсе
 */
function generateMockFlight(flightNumber: string, date: Date): any {
  console.log('Генерация моковых данных для рейса:', flightNumber, 'на дату:', date.toISOString());

  // Извлекаем код авиакомпании (первые 2 символа)
  const iataAirlineCode = flightNumber.substring(0, 2);

  // Ищем авиакомпанию по IATA коду
  const airline = Object.values(AIRLINES).find(a => a.iata === iataAirlineCode);
  const airlineName = airline?.name || 'Тестовая авиакомпания';

  // Выбираем случайные аэропорты для демонстрации
  const airports = Object.values(AIRPORTS);
  const departureAirport = airports[Math.floor(Math.random() * airports.length)].name;
  const arrivalAirport = airports[Math.floor(Math.random() * airports.length)].name;

  // Если аэропорты совпадают, выбираем другой аэропорт прилета
  const arrivalAirportFinal = departureAirport === arrivalAirport
    ? airports[(Math.floor(Math.random() * airports.length) + 1) % airports.length].name
    : arrivalAirport;

  // Создаем даты вылета и прилета
  const departureDate = new Date(date);
  departureDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

  const arrivalDate = new Date(departureDate);
  arrivalDate.setHours(arrivalDate.getHours() + 1 + Math.floor(Math.random() * 5));

  // Формируем моковые данные о рейсе
  return {
    flight_number: flightNumber,
    airline: airlineName,
    departure_city: departureAirport,
    arrival_city: arrivalAirportFinal,
    departure_date: departureDate.toISOString().split('T')[0],
    departure_time: departureDate.toTimeString().substring(0, 5),
    arrival_date: arrivalDate.toISOString().split('T')[0],
    arrival_time: arrivalDate.toTimeString().substring(0, 5),
    aircraft_type: 'Boeing 737',
    departure_timezone: 'UTC',
    arrival_timezone: 'UTC',
  };
}

/**
 * Обработчик GET-запроса для получения информации о рейсе
 * @param request Запрос
 * @returns Ответ с информацией о рейсе
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Получен запрос к API flight-lookup');

    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams;
    const flightNumber = searchParams.get('flight_number');
    const date = searchParams.get('date');

    console.log('Параметры запроса:', { flightNumber, date });

    // Проверяем наличие обязательных параметров
    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Не указан номер рейса' },
        { status: 400 }
      );
    }

    // Преобразуем IATA номер рейса в ICAO формат для поиска
    // Например, SU1234 -> AFL1234
    let icaoFlightNumber = flightNumber;
    const iataAirlineCode = flightNumber.substring(0, 2);
    const flightNumberDigits = flightNumber.substring(2);

    console.log('Разбор номера рейса:', {
      iataFlightNumber: flightNumber,
      iataAirlineCode,
      flightNumberDigits
    });

    // Ищем авиакомпанию по IATA коду
    const airline = Object.values(AIRLINES).find(a => a.iata === iataAirlineCode);
    console.log('Найденная авиакомпания:', airline || 'Не найдена');

    if (airline) {
      icaoFlightNumber = `${airline.icao}${flightNumberDigits}`;
      console.log('Преобразованный ICAO номер рейса:', icaoFlightNumber);
    } else {
      console.log('Не удалось преобразовать номер рейса, используем исходный:', icaoFlightNumber);
    }

    // Формируем URL для запроса к OpenSky API
    // Поскольку API имеет ограничения, сразу используем моковые данные для демонстрации
    console.log('Используем моковые данные для демонстрации');
    const mockFlight = generateMockFlight(flightNumber, date ? new Date(date) : new Date());
    return NextResponse.json(mockFlight);

    // В реальном приложении можно использовать следующий код:
    // let apiUrl = `${OPENSKY_API_URL}/flights/all`;

    // Определяем временной интервал для поиска
    // OpenSky API ограничивает запросы до 2 часов данных
    const searchDate = date ? new Date(date) : new Date();

    // Используем текущее время и ограничиваем интервал 2 часами
    const now = new Date();
    const begin = Math.floor(now.getTime() / 1000) - 3600; // 1 час назад
    const end = Math.floor(now.getTime() / 1000) + 3600;   // 1 час вперед

    console.log('Временной интервал для поиска:', {
      searchDate: searchDate.toISOString(),
      begin,
      end,
      beginDate: new Date(begin * 1000).toISOString(),
      endDate: new Date(end * 1000).toISOString()
    });

    // Добавляем параметры запроса
    apiUrl += `?begin=${begin}&end=${end}`;
    console.log('URL для запроса к API:', apiUrl);

    // Настраиваем заголовки для Basic Authentication
    const headers: HeadersInit = {};
    if (OPENSKY_USERNAME && OPENSKY_PASSWORD) {
      console.log('Используем аутентификацию с учетными данными:', {
        username: OPENSKY_USERNAME,
        passwordLength: OPENSKY_PASSWORD.length
      });

      const auth = Buffer.from(`${OPENSKY_USERNAME}:${OPENSKY_PASSWORD}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
      console.log('Заголовок Authorization создан');
    } else {
      console.log('Учетные данные не указаны, используем анонимный доступ');
    }

    // Отправляем запрос к OpenSky API
    console.log('Отправка запроса к OpenSky API:', apiUrl);
    console.log('Заголовки:', headers);

    const response = await fetch(apiUrl, { headers });

    // Проверяем статус ответа
    if (!response.ok) {
      console.error('Ошибка API OpenSky:', response.status, response.statusText);

      try {
        // Пытаемся получить тело ответа для более подробной информации
        const errorBody = await response.text();
        console.error('Тело ответа:', errorBody);

        return NextResponse.json(
          { error: `Ошибка API: ${response.status} ${response.statusText}. Подробности: ${errorBody}` },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          { error: `Ошибка API: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
    }

    // Получаем данные из ответа
    let flights;
    try {
      const responseText = await response.text();
      console.log('Ответ от API (первые 500 символов):', responseText.substring(0, 500));

      flights = JSON.parse(responseText);
      console.log('Количество полученных рейсов:', Array.isArray(flights) ? flights.length : 'Не массив');
    } catch (error) {
      console.error('Ошибка при парсинге ответа:', error);
      return NextResponse.json(
        { error: 'Ошибка при обработке ответа от API' },
        { status: 500 }
      );
    }

    // Проверяем, что flights - это массив
    if (!Array.isArray(flights)) {
      console.error('Ответ API не является массивом:', flights);
      return NextResponse.json(
        { error: 'Некорректный формат ответа от API' },
        { status: 500 }
      );
    }

    // Ищем рейс по позывному (callsign)
    console.log('Ищем рейс с позывным:', icaoFlightNumber);
    const flight = flights.find((f: any) => {
      const callsign = f.callsign && f.callsign.trim();
      const match = callsign === icaoFlightNumber;
      if (match) {
        console.log('Найден соответствующий рейс:', f);
      }
      return match;
    });

    // Если рейс не найден, используем моковые данные для демонстрации
    if (!flight) {
      console.log('Рейс не найден в API, используем моковые данные');

      // Используем моковые данные для демонстрации
      const mockFlight = generateMockFlight(flightNumber, date ? new Date(date) : new Date());

      return NextResponse.json(mockFlight);
    }

    // Получаем информацию о аэропортах вылета и прилета
    const departureAirport = getAirportName(flight.estDepartureAirport);
    const arrivalAirport = getAirportName(flight.estArrivalAirport);

    // Преобразуем UNIX timestamp в дату и время
    const departureDate = new Date(flight.firstSeen * 1000);
    const arrivalDate = new Date(flight.lastSeen * 1000);

    // Формируем ответ
    const flightInfo = {
      flight_number: callsignToFlightNumber(flight.callsign.trim()),
      airline: airline?.name || 'Неизвестная авиакомпания',
      departure_city: departureAirport,
      arrival_city: arrivalAirport,
      departure_date: departureDate.toISOString().split('T')[0],
      departure_time: departureDate.toTimeString().substring(0, 5),
      arrival_date: arrivalDate.toISOString().split('T')[0],
      arrival_time: arrivalDate.toTimeString().substring(0, 5),
      aircraft_type: flight.aircraftType || 'Неизвестный тип',
      departure_timezone: 'UTC',
      arrival_timezone: 'UTC',
    };

    // Возвращаем данные о рейсе
    return NextResponse.json(flightInfo);
  } catch (error: any) {
    console.error('Ошибка при получении информации о рейсе:', error);

    // Возвращаем ошибку
    return NextResponse.json(
      { error: `Ошибка сервера: ${error.message}` },
      { status: 500 }
    );
  }
}
