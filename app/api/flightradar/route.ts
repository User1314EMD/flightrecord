/**
 * API-route для получения информации о рейсе из Flightradar24
 */
import { NextRequest, NextResponse } from 'next/server';
import { FlightRadar24API } from 'flightradarapi';

// Инициализируем API клиент
const fr24 = new FlightRadar24API();

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
    console.log('Получен запрос к API flightradar');

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

    try {
      console.log('Поиск рейса в Flightradar24:', flightNumber);

      // Получаем информацию о рейсе
      console.log('Поиск рейсов по номеру:', flightNumber);
      const flights = await fr24.getFlights(null, null, flightNumber);
      console.log('Найдено рейсов:', flights ? flights.length : 0);

      // Если рейсы не найдены, возвращаем моковые данные
      if (!flights || flights.length === 0) {
        console.log('Рейсы не найдены, используем моковые данные');
        return NextResponse.json(generateMockFlight(flightNumber, date ? new Date(date) : new Date()));
      }

      // Берем первый рейс из списка
      const flight = flights[0];
      console.log('Найден рейс:', flight);

      // Получаем детальную информацию о рейсе
      console.log('Получение деталей рейса с ID:', flight.id);
      const flightDetails = await fr24.getFlightDetails(flight.id);
      console.log('Получены детали рейса:', flightDetails ? 'Да' : 'Нет');

      // Устанавливаем детали рейса
      if (flightDetails) {
        flight.setFlightDetails(flightDetails);
      }

      // Формируем ответ
      const flightInfo = {
        flight_number: flight.callsign || flightNumber,
        airline: flight.airline || 'Неизвестная авиакомпания',
        departure_city: flight.origin || 'Неизвестный аэропорт',
        arrival_city: flight.destination || 'Неизвестный аэропорт',
        departure_date: flight.departureTime
          ? new Date(flight.departureTime * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        departure_time: flight.departureTime
          ? new Date(flight.departureTime * 1000).toTimeString().substring(0, 5)
          : new Date().toTimeString().substring(0, 5),
        arrival_date: flight.arrivalTime
          ? new Date(flight.arrivalTime * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        arrival_time: flight.arrivalTime
          ? new Date(flight.arrivalTime * 1000).toTimeString().substring(0, 5)
          : new Date().toTimeString().substring(0, 5),
        aircraft_type: flight.aircraftModel || 'Неизвестный тип',
        departure_timezone: 'UTC',
        arrival_timezone: 'UTC',
      };

      // Возвращаем данные о рейсе
      return NextResponse.json(flightInfo);
    } catch (apiError: any) {
      console.error('Ошибка при запросе к Flightradar24 API:', apiError);
      console.log('Используем моковые данные из-за ошибки API');

      // В случае ошибки API используем моковые данные
      return NextResponse.json(generateMockFlight(flightNumber, date ? new Date(date) : new Date()));
    }
  } catch (error: any) {
    console.error('Ошибка при получении информации о рейсе:', error);

    // Возвращаем ошибку
    return NextResponse.json(
      { error: `Ошибка сервера: ${error.message}` },
      { status: 500 }
    );
  }
}
