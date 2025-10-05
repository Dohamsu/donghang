import React, { useState, useEffect } from 'react';
import { TravelPlan, Place, KakaoPlace, Schedule } from '../../types';
import { KakaoPlacesService } from '../../services/kakaoPlacesService';
import { PlaceService } from '../../services/placeService';
import { ScheduleService } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import PlaceSearch from './PlaceSearch';
import PlaceList from './PlaceList';
import PlaceDetails from './PlaceDetails';
import CategoryFilter from './CategoryFilter';
import ScheduleForm from '../schedule/ScheduleForm';
import { Button } from '../ui';

interface ExploreTabProps {
  plan: TravelPlan;
  isOwner: boolean;
}

const ExploreTab: React.FC<ExploreTabProps> = ({ plan, isOwner }) => {
  const alert = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [placeToSchedule, setPlaceToSchedule] = useState<Place | null>(null);
  const placeService = new PlaceService();
  const scheduleService = new ScheduleService();

  useEffect(() => {
    if (plan.region) {
      handleSearch(plan.region);
    }
  }, [plan.region]);

  const handleSearch = async (query: string, category?: string) => {
    if (!query.trim() && !category) return;

    setLoading(true);
    try {
      let kakaoPlaces: KakaoPlace[] = [];

      if (category) {
        kakaoPlaces = await KakaoPlacesService.searchByCategory(category);
      } else {
        kakaoPlaces = await KakaoPlacesService.searchPlaces(query);
      }

      const places = kakaoPlaces.map((kakaoPlace) =>
        KakaoPlacesService.convertToPlace(kakaoPlace)
      );

      setSearchResults(places);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      handleSearch('', category);
    } else {
      setSearchResults([]);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setShowDetails(true);
  };

  const handleAddToTemporary = async (place: Place) => {
    try {
      await placeService.addToTemporaryStorage(plan.id, place);
      alert.success('임시보관함에 추가되었습니다.');
    } catch (error) {
      console.error('Failed to add to temporary storage:', error);
      alert.error('임시보관함 추가에 실패했습니다.');
    }
  };

  const handleAddToSchedule = async (place: Place) => {
    // 장소를 먼저 저장
    try {
      const savedPlace = await placeService.savePlace(place);

      // 일정 추가 모달 열기
      setPlaceToSchedule(savedPlace);
      setShowScheduleForm(true);
    } catch (error) {
      console.error('Failed to save place:', error);
      alert.error('장소 저장에 실패했습니다.');
    }
  };

  const handleScheduleSubmit = async (scheduleData: Partial<Schedule>) => {
    if (!placeToSchedule) return;

    try {
      const newSchedule = await scheduleService.createSchedule(
        plan.id,
        scheduleData.date!,
        placeToSchedule.id,
        scheduleData.startTime!,
        scheduleData.endTime!,
        0 // order will be updated by timeline
      );

      // notes가 있으면 업데이트
      if (scheduleData.notes) {
        await scheduleService.updateSchedule(newSchedule.id, {
          notes: scheduleData.notes,
        });
      }

      alert.success('일정에 추가되었습니다!');
      setShowScheduleForm(false);
      setPlaceToSchedule(null);
    } catch (error) {
      console.error('Failed to add schedule:', error);
      alert.error('일정 추가에 실패했습니다.');
    }
  };

  if (plan.confirmed) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            일정이 확정되었습니다
          </h3>
          <p className="text-gray-600">
            확정된 일정에서는 장소를 탐색할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">장소 탐색</h3>
            <p className="text-sm text-gray-600">
              {plan.region} 지역의 다양한 장소를 찾아보세요
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <PlaceSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={(query) => handleSearch(query)}
          placeholder={`${plan.region}에서 장소 검색...`}
          loading={loading}
        />
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-200 px-6 py-3">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Content */}
      <div className="flex">
        {/* Search Results */}
        <div className="flex-1">
          <PlaceList
            places={searchResults}
            loading={loading}
            onPlaceSelect={handlePlaceSelect}
            onAddToTemporary={isOwner ? handleAddToTemporary : undefined}
            onAddToSchedule={isOwner ? handleAddToSchedule : undefined}
          />
        </div>

        {/* Place Details Sidebar */}
        {showDetails && selectedPlace && (
          <div className="w-96 border-l border-gray-200">
            <PlaceDetails
              place={selectedPlace}
              onClose={() => setShowDetails(false)}
              onAddToTemporary={isOwner ? handleAddToTemporary : undefined}
              onAddToSchedule={isOwner ? handleAddToSchedule : undefined}
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading &&
        searchResults.length === 0 &&
        !selectedCategory &&
        !searchQuery && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                장소를 검색해보세요
              </h3>
              <p className="text-gray-600 mb-6">
                카테고리를 선택하거나 검색어를 입력하여 원하는 장소를
                찾아보세요.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['관광명소', '음식점', '숙박', '카페'].map((keyword) => (
                  <Button
                    key={keyword}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSearch(keyword)}
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Schedule Form Modal */}
      {showScheduleForm && placeToSchedule && (
        <ScheduleForm
          date={plan.startDate}
          places={[placeToSchedule]}
          onSubmit={handleScheduleSubmit}
          onCancel={() => {
            setShowScheduleForm(false);
            setPlaceToSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default ExploreTab;
