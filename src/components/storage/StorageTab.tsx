import React, { useState, useEffect, useCallback } from 'react';
import { TravelPlan, TemporaryPlace, Place, Schedule } from '../../types';
import { PlaceService } from '../../services/placeService';
import { ScheduleService } from '../../services';
import StorageItem from './StorageItem';
import CalendarView from '../schedule/CalendarView';
import { Button } from '../ui';

interface StorageTabProps {
  plan: TravelPlan;
  isOwner: boolean;
}

const StorageTab: React.FC<StorageTabProps> = ({ plan, isOwner }) => {
  const [temporaryPlaces, setTemporaryPlaces] = useState<TemporaryPlace[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(plan.startDate);
  const placeService = new PlaceService();
  const scheduleService = new ScheduleService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tempPlaces, schedulesData] = await Promise.all([
        placeService.getTemporaryPlaces(plan.id),
        scheduleService.getSchedulesByPlan(plan.id),
      ]);
      setTemporaryPlaces(tempPlaces);
      setSchedules(schedulesData);

      // 일정에 있는 장소들 로드
      const placeIds = Array.from(
        new Set(schedulesData.map((s) => s.placeId).filter(Boolean))
      );
      const placesData: Place[] = [];
      for (const placeId of placeIds) {
        const place = await placeService.getPlace(placeId);
        if (place) {
          placesData.push(place);
        }
      }
      setPlaces(placesData);
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (tempPlaceId: string) => {
    try {
      await placeService.removeFromTemporaryStorage(tempPlaceId);
      setTemporaryPlaces((prev) =>
        prev.filter((item) => item.id !== tempPlaceId)
      );
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('임시보관함을 모두 비우시겠습니까?')) {
      return;
    }

    try {
      const promises = temporaryPlaces.map((item) =>
        placeService.removeFromTemporaryStorage(item.id)
      );
      await Promise.all(promises);
      setTemporaryPlaces([]);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  };

  const groupByCategory = (places: TemporaryPlace[]) => {
    return places.reduce(
      (groups, tempPlace) => {
        const category = tempPlace.place.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(tempPlace);
        return groups;
      },
      {} as Record<string, TemporaryPlace[]>
    );
  };

  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      accommodation: '숙박',
      restaurant: '음식점',
      tourist_attraction: '관광명소',
      shopping: '쇼핑',
      entertainment: '엔터테인먼트',
      transport: '교통',
      other: '기타',
    };
    return names[category] || category;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      accommodation: '🏨',
      restaurant: '🍽️',
      tourist_attraction: '🎭',
      shopping: '🛍️',
      entertainment: '🎪',
      transport: '🚌',
      other: '📍',
    };
    return icons[category] || '📍';
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
            확정된 일정에서는 임시보관함을 사용할 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-4 animate-pulse"
            >
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (temporaryPlaces.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            임시보관함이 비어있습니다
          </h3>
          <p className="text-gray-600 mb-6">
            탐색 탭에서 장소를 찾고 임시보관함에 저장해보세요.
          </p>
          <Button variant="secondary">탐색 탭으로 이동</Button>
        </div>
      </div>
    );
  }

  const groupedPlaces = groupByCategory(temporaryPlaces);

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              임시보관함 & 일정 캘린더
            </h3>
            <p className="text-sm text-gray-600">
              총 {temporaryPlaces.length}개의 장소 · 장소를 드래그하여 캘린더에
              추가하세요
            </p>
          </div>
          {isOwner && temporaryPlaces.length > 0 && (
            <Button variant="secondary" onClick={handleClearAll} size="sm">
              모두 비우기
            </Button>
          )}
        </div>
      </div>

      {/* Content - Two sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Storage Items Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="mb-3">
            <h4 className="text-md font-medium text-gray-900">
              📦 임시 보관함
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              아래 장소를 드래그하여 캘린더 날짜에 드롭하세요
            </p>
          </div>
          <div className="space-y-6">
            {Object.entries(groupedPlaces).map(([category, places]) => (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <h4 className="font-medium text-gray-900">
                    {getCategoryName(category)}
                  </h4>
                  <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                    {places.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {places.map((tempPlace) => (
                    <StorageItem
                      key={tempPlace.id}
                      tempPlace={tempPlace}
                      onRemove={() => handleRemove(tempPlace.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-gray-50">
          <div className="p-6">
            <div className="mb-3">
              <h4 className="text-md font-medium text-gray-900">
                📅 일정 캘린더
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                위의 장소를 원하는 날짜로 드래그앤드롭하세요
              </p>
            </div>
            <CalendarView
              startDate={plan.startDate}
              endDate={plan.endDate}
              schedules={schedules}
              places={places}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageTab;
