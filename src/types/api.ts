export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  category?: string;
  keyword?: string;
  region?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface CreateTravelPlanRequest {
  title: string;
  startDate: string;
  endDate: string;
  region: string;
}

export interface UpdateTravelPlanRequest {
  title?: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  confirmed?: boolean;
}

export interface ShareLinkRequest {
  planId: string;
  role: string;
  expiresAt?: string;
}

export interface ShareLinkResponse {
  shareUrl: string;
  token: string;
  expiresAt: string;
}
