import React from 'react';
import { Place } from '../../types';
import PlaceCard from './PlaceCard';

interface PlaceListProps {
  places: Place[];
  loading: boolean;
  onPlaceSelect: (place: Place) => void;
  onAddToTemporary?: (place: Place) => void;
  onAddToSchedule?: (place: Place) => void;
}

const PlaceList: React.FC<PlaceListProps> = ({
  places,
  loading,
  onPlaceSelect,
  onAddToTemporary,
  onAddToSchedule,
}) => {
  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-600">
            다른 검색어나 카테고리를 시도해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          총 <span className="font-medium text-gray-900">{places.length}</span>
          개의 장소를 찾았습니다
        </p>
      </div>

      <div className="space-y-4">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onSelect={() => onPlaceSelect(place)}
            onAddToTemporary={
              onAddToTemporary ? () => onAddToTemporary(place) : undefined
            }
            onAddToSchedule={
              onAddToSchedule ? () => onAddToSchedule(place) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default PlaceList;
