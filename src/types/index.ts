export interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  region: string;
  weatherSummary?: WeatherSummary;
  confirmed: boolean;
  ownerId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface WeatherSummary {
  maxTemp: number;
  minTemp: number;
  dust: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer',
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  description?: string;
  images: string[];
  address?: string;
  phone?: string;
  website?: string;
}

export enum PlaceCategory {
  ACCOMMODATION = 'accommodation',
  RESTAURANT = 'restaurant',
  TOURIST_ATTRACTION = 'tourist_attraction',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  TRANSPORT = 'transport',
  OTHER = 'other',
}

export interface Schedule {
  id: string;
  planId: string;
  date: string;
  placeId: string;
  startTime: string;
  endTime: string;
  eta?: number;
  order: number;
  notes?: string;
}

export interface ScheduleDay {
  date: string;
  schedules: Schedule[];
  totalDuration: number;
}

export interface TimelineItem {
  id: string;
  type: 'schedule' | 'travel';
  schedule?: Schedule;
  place?: Place;
  travelTime?: number;
  order: number;
}

export interface BudgetItem {
  id: string;
  planId: string;
  day?: string;
  placeId?: string;
  amount: number;
  description: string;
  category: BudgetCategory;
  createdAt: string;
}

export enum BudgetCategory {
  ACCOMMODATION = 'accommodation',
  FOOD = 'food',
  TRANSPORT = 'transport',
  ACTIVITY = 'activity',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

export interface PackingItem {
  id: string;
  planId: string;
  text: string;
  imageUrl?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  planId: string;
  placeId?: string;
  content: string;
  images: string[];
  writtenAt: string;
  authorId: string;
  rating?: number;
  type: ReviewType;
}

export enum ReviewType {
  PLACE = 'place',
  DAILY = 'daily',
}

export interface TemporaryPlace {
  id: string;
  planId: string;
  place: Place;
  addedAt: string;
  isRecommended?: boolean;
}

export interface AppState {
  currentUser: User;
  travelPlans: TravelPlan[];
  places: Place[];
  schedules: Schedule[];
  budgetItems: BudgetItem[];
  packingItems: PackingItem[];
  reviews: ReviewItem[];
  temporaryPlaces: TemporaryPlace[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
}
