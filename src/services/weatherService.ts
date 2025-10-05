import { WeatherData, GeocodingResult, WeatherSummary } from '../types';

export class WeatherService {
  private static readonly GEOCODING_BASE_URL =
    'https://geocoding-api.open-meteo.com/v1';
  private static readonly WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';

  public static async searchLocation(
    query: string
  ): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(
        `${this.GEOCODING_BASE_URL}/search?name=${encodeURIComponent(
          query
        )}&count=10&language=ko&format=json`
      );

      if (!response.ok) {
        throw new Error('Geocoding API 요청 실패');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Location search error:', error);
      throw new Error('위치 검색 중 오류가 발생했습니다.');
    }
  }

  public static async getWeatherForecast(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): Promise<WeatherData> {
    try {
      const response = await fetch(
        `${this.WEATHER_BASE_URL}/forecast?` +
          `latitude=${latitude}&longitude=${longitude}&` +
          `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&` +
          `start_date=${startDate}&end_date=${endDate}&timezone=Asia/Seoul`
      );

      if (!response.ok) {
        throw new Error('Weather API 요청 실패');
      }

      const data = await response.json();
      return {
        latitude,
        longitude,
        daily: data.daily,
      };
    } catch (error) {
      console.error('Weather forecast error:', error);
      throw new Error('날씨 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  public static generateWeatherSummary(
    weatherData: WeatherData
  ): WeatherSummary {
    const { daily } = weatherData;

    if (!daily || !daily.temperature_2m_max || !daily.temperature_2m_min) {
      return {
        maxTemp: 0,
        minTemp: 0,
        dust: '정보 없음',
        description: '날씨 정보를 가져올 수 없습니다.',
      };
    }

    const maxTemp = Math.max(...daily.temperature_2m_max);
    const minTemp = Math.min(...daily.temperature_2m_min);
    const averagePrecipitation = daily.precipitation_sum
      ? daily.precipitation_sum.reduce((acc, val) => acc + val, 0) /
        daily.precipitation_sum.length
      : 0;

    let description = '';
    if (averagePrecipitation > 5) {
      description = '비가 예상되는 날이 있어요';
    } else if (maxTemp > 30) {
      description = '더운 날씨가 예상돼요';
    } else if (minTemp < 5) {
      description = '추운 날씨가 예상돼요';
    } else {
      description = '쾌적한 날씨가 예상돼요';
    }

    return {
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
      dust: '보통',
      description,
    };
  }

  public static getWeatherCodeDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: '맑음',
      1: '대체로 맑음',
      2: '부분적으로 흐림',
      3: '흐림',
      45: '안개',
      48: '진무',
      51: '가벼운 이슬비',
      53: '보통 이슬비',
      55: '강한 이슬비',
      61: '가벼운 비',
      63: '보통 비',
      65: '강한 비',
      71: '가벼운 눈',
      73: '보통 눈',
      75: '강한 눈',
      77: '진눈깨비',
      80: '가벼운 소나기',
      81: '보통 소나기',
      82: '강한 소나기',
      85: '가벼운 눈 소나기',
      86: '강한 눈 소나기',
      95: '뇌우',
      96: '뇌우와 우박',
      99: '강한 뇌우와 우박',
    };

    return weatherCodes[code] || '알 수 없음';
  }

  public static formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  public static getDailyWeatherInfo(
    weatherData: WeatherData,
    dateIndex: number
  ): {
    date: string;
    maxTemp: number;
    minTemp: number;
    precipitation: number;
    description: string;
  } | null {
    const { daily } = weatherData;

    if (
      !daily ||
      !daily.time ||
      dateIndex >= daily.time.length ||
      !daily.temperature_2m_max ||
      !daily.temperature_2m_min
    ) {
      return null;
    }

    return {
      date: daily.time[dateIndex],
      maxTemp: Math.round(daily.temperature_2m_max[dateIndex]),
      minTemp: Math.round(daily.temperature_2m_min[dateIndex]),
      precipitation: daily.precipitation_sum
        ? daily.precipitation_sum[dateIndex]
        : 0,
      description: daily.weather_code
        ? this.getWeatherCodeDescription(daily.weather_code[dateIndex])
        : '알 수 없음',
    };
  }
}
