import { KakaoPlace, Place, PlaceCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class KakaoPlacesService {
  private static readonly API_KEY = 'YOUR_KAKAO_API_KEY'; // 실제 사용시 환경변수로 설정
  private static readonly BASE_URL = 'https://dapi.kakao.com/v2/local';

  public static async searchPlaces(
    query: string,
    x?: number,
    y?: number,
    radius?: number
  ): Promise<KakaoPlace[]> {
    try {
      const params = new URLSearchParams({
        query,
        size: '15',
        ...(x && y && { x: x.toString(), y: y.toString() }),
        ...(radius && { radius: radius.toString() }),
      });

      const response = await fetch(
        `${this.BASE_URL}/search/keyword.json?${params}`,
        {
          headers: {
            Authorization: `KakaoAK ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Kakao Places API error:', error);
      // API 키가 없거나 오류 시 목업 데이터 반환
      return this.getMockPlaces(query);
    }
  }

  public static async searchByCategory(
    categoryCode: string,
    x?: number,
    y?: number,
    radius?: number
  ): Promise<KakaoPlace[]> {
    try {
      const params = new URLSearchParams({
        category_group_code: categoryCode,
        size: '15',
        ...(x && y && { x: x.toString(), y: y.toString() }),
        ...(radius && { radius: radius.toString() }),
      });

      const response = await fetch(
        `${this.BASE_URL}/search/category.json?${params}`,
        {
          headers: {
            Authorization: `KakaoAK ${this.API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Kakao Places API error:', error);
      return this.getMockPlacesByCategory(categoryCode);
    }
  }

  public static convertToPlace(kakaoPlace: KakaoPlace): Place {
    return {
      id: uuidv4(),
      name: kakaoPlace.place_name,
      category: this.mapKakaoCategory(kakaoPlace.category_group_code),
      latitude: parseFloat(kakaoPlace.y),
      longitude: parseFloat(kakaoPlace.x),
      description: kakaoPlace.category_name,
      images: [],
      address: kakaoPlace.address_name,
      phone: kakaoPlace.phone || undefined,
      website: kakaoPlace.place_url || undefined,
    };
  }

  private static mapKakaoCategory(categoryCode: string): PlaceCategory {
    const categoryMap: Record<string, PlaceCategory> = {
      MT1: PlaceCategory.SHOPPING, // 대형마트
      CS2: PlaceCategory.SHOPPING, // 편의점
      PS3: PlaceCategory.SHOPPING, // 어린이집, 유치원
      SC4: PlaceCategory.SHOPPING, // 학교
      AC5: PlaceCategory.SHOPPING, // 학원
      PK6: PlaceCategory.TRANSPORT, // 주차장
      OL7: PlaceCategory.OTHER, // 주유소, 충전소
      SW8: PlaceCategory.TRANSPORT, // 지하철역
      BK9: PlaceCategory.OTHER, // 은행
      CT1: PlaceCategory.OTHER, // 문화시설
      AG2: PlaceCategory.OTHER, // 중개업소
      PO3: PlaceCategory.OTHER, // 공공기관
      AT4: PlaceCategory.TOURIST_ATTRACTION, // 관광명소
      AD5: PlaceCategory.ACCOMMODATION, // 숙박
      FD6: PlaceCategory.RESTAURANT, // 음식점
      CE7: PlaceCategory.ENTERTAINMENT, // 카페
      HP8: PlaceCategory.OTHER, // 병원
      PM9: PlaceCategory.OTHER, // 약국
    };

    return categoryMap[categoryCode] || PlaceCategory.OTHER;
  }

  private static getMockPlaces(query: string): KakaoPlace[] {
    const mockPlaces: KakaoPlace[] = [
      {
        id: '1',
        place_name: `${query} 관련 장소 1`,
        category_name: '관광,명소 > 관광지',
        category_group_code: 'AT4',
        phone: '02-123-4567',
        address_name: '서울 중구 세종대로 110',
        road_address_name: '서울 중구 세종대로 110',
        x: '126.9779692',
        y: '37.5662952',
        place_url: 'http://place.map.kakao.com/1',
      },
      {
        id: '2',
        place_name: `${query} 관련 장소 2`,
        category_name: '음식점 > 한식',
        category_group_code: 'FD6',
        phone: '02-234-5678',
        address_name: '서울 중구 명동길 20',
        road_address_name: '서울 중구 명동길 20',
        x: '126.9849208',
        y: '37.5635207',
        place_url: 'http://place.map.kakao.com/2',
      },
      {
        id: '3',
        place_name: `${query} 관련 장소 3`,
        category_name: '숙박 > 호텔',
        category_group_code: 'AD5',
        phone: '02-345-6789',
        address_name: '서울 중구 을지로 30',
        road_address_name: '서울 중구 을지로 30',
        x: '126.9895796',
        y: '37.5658049',
        place_url: 'http://place.map.kakao.com/3',
      },
    ];

    return mockPlaces;
  }

  private static getMockPlacesByCategory(categoryCode: string): KakaoPlace[] {
    const categoryData: Record<string, Partial<KakaoPlace>[]> = {
      AT4: [
        {
          place_name: '경복궁',
          category_name: '관광,명소 > 고궁',
          x: '126.9769450',
          y: '37.5788408',
        },
        {
          place_name: 'N서울타워',
          category_name: '관광,명소 > 전망대',
          x: '126.9882266',
          y: '37.5511694',
        },
      ],
      FD6: [
        {
          place_name: '명동교자',
          category_name: '음식점 > 한식',
          x: '126.9849208',
          y: '37.5635207',
        },
        {
          place_name: '전주중앙회관',
          category_name: '음식점 > 한식',
          x: '126.9849123',
          y: '37.5634567',
        },
      ],
      AD5: [
        {
          place_name: '롯데호텔 서울',
          category_name: '숙박 > 호텔',
          x: '126.9895796',
          y: '37.5658049',
        },
        {
          place_name: '플라자호텔',
          category_name: '숙박 > 호텔',
          x: '126.9783740',
          y: '37.5667177',
        },
      ],
    };

    const mockData = categoryData[categoryCode] || [];
    return mockData.map((item, index) => ({
      id: `${categoryCode}-${index}`,
      place_name: item.place_name || '장소명',
      category_name: item.category_name || '기타',
      category_group_code: categoryCode,
      phone: '02-123-4567',
      address_name: '서울특별시 중구',
      road_address_name: '서울특별시 중구',
      x: item.x || '126.9779692',
      y: item.y || '37.5662952',
      place_url: `http://place.map.kakao.com/${categoryCode}-${index}`,
    }));
  }

  public static getCategoryGroups() {
    return [
      { code: 'AT4', name: '관광명소', icon: '🎭' },
      { code: 'FD6', name: '음식점', icon: '🍽️' },
      { code: 'AD5', name: '숙박', icon: '🏨' },
      { code: 'CE7', name: '카페', icon: '☕' },
      { code: 'MT1', name: '마트', icon: '🛒' },
      { code: 'SW8', name: '지하철역', icon: '🚇' },
      { code: 'PK6', name: '주차장', icon: '🅿️' },
      { code: 'HP8', name: '병원', icon: '🏥' },
    ];
  }
}
