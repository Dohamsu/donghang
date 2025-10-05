import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, DatePicker } from '../components/ui';
import { TravelPlanService, WeatherService } from '../services';
import { CreateTravelPlanRequest } from '../types/api';
import { GeocodingResult } from '../types';

const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    region: '',
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [locationResults, setLocationResults] = useState<GeocodingResult[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const travelPlanService = new TravelPlanService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setLocationResults([]);
      return;
    }

    try {
      const results = await WeatherService.searchLocation(query);
      setLocationResults(results.slice(0, 5)); // 상위 5개만 표시
    } catch (error) {
      console.error('Location search error:', error);
      setLocationResults([]);
    }
  };

  const handleLocationSearch = () => {
    if (formData.region) {
      searchLocation(formData.region);
      setShowLocationModal(true);
    }
  };

  const selectLocation = (location: GeocodingResult) => {
    const locationName = location.admin1
      ? `${location.name}, ${location.admin1}`
      : location.name;
    setFormData((prev) => ({ ...prev, region: locationName }));
    setShowLocationModal(false);
    setLocationResults([]);
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return '여행 계획 제목을 입력해주세요.';
    }
    if (!startDate) {
      return '시작 날짜를 선택해주세요.';
    }
    if (!endDate) {
      return '종료 날짜를 선택해주세요.';
    }
    if (!formData.region.trim()) {
      return '여행 지역을 입력해주세요.';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return '시작 날짜는 오늘 이후여야 합니다.';
    }
    if (endDate <= startDate) {
      return '종료 날짜는 시작 날짜보다 이후여야 합니다.';
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      return '여행 기간은 30일을 초과할 수 없습니다.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = travelPlanService.getCurrentUserId();
      const startDateStr = startDate!.toISOString().split('T')[0];
      const endDateStr = endDate!.toISOString().split('T')[0];

      const createRequest: CreateTravelPlanRequest = {
        title: formData.title.trim(),
        startDate: startDateStr,
        endDate: endDateStr,
        region: formData.region.trim(),
      };

      const newPlan = await travelPlanService.createTravelPlan(
        createRequest,
        userId
      );

      // 날씨 정보 가져오기 시도
      try {
        const locationResults = await WeatherService.searchLocation(
          formData.region
        );
        if (locationResults.length > 0) {
          const location = locationResults[0];
          const weatherData = await WeatherService.getWeatherForecast(
            location.latitude,
            location.longitude,
            startDateStr,
            endDateStr
          );
          const weatherSummary =
            WeatherService.generateWeatherSummary(weatherData);

          await travelPlanService.updateTravelPlan(newPlan.id, {
            weatherSummary,
          });
        }
      } catch (weatherError) {
        console.error('Failed to fetch weather data:', weatherError);
        // 날씨 정보 실패해도 계획 생성은 계속 진행
      }

      navigate(`/plan/${newPlan.id}`);
    } catch (err) {
      setError('여행 계획 생성 중 오류가 발생했습니다.');
      console.error('Failed to create travel plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              새 여행 계획 만들기
            </h1>
            <p className="text-gray-600">
              멋진 여행을 위한 첫 번째 단계입니다. 기본 정보를 입력해주세요.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                여행 계획 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예: 제주도 힐링 여행"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/50
              </p>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작 날짜 *
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  minDate={new Date()}
                  placeholderText="시작 날짜 선택"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료 날짜 *
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  minDate={startDate || new Date()}
                  placeholderText="종료 날짜 선택"
                />
              </div>
            </div>

            {/* 지역 */}
            <div>
              <label
                htmlFor="region"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                여행 지역 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="예: 제주도, 부산, 서울"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleLocationSearch}
                  disabled={!formData.region.trim()}
                >
                  검색
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                정확한 날씨 정보를 위해 지역 검색을 사용해보세요.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="flex-1"
              >
                {loading ? '생성 중...' : '여행 계획 만들기'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Location Search Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="지역 선택"
        size="md"
      >
        <div className="space-y-3">
          {locationResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              검색 결과가 없습니다.
            </p>
          ) : (
            locationResults.map((location) => (
              <button
                key={location.id}
                onClick={() => selectLocation(location)}
                className="w-full text-left p-3 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="font-medium text-gray-900">{location.name}</div>
                <div className="text-sm text-gray-500">
                  {location.admin1 && `${location.admin1}, `}
                  {location.country}
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreatePlan;
