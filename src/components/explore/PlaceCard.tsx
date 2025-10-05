import React from 'react';
import { Place, PlaceCategory } from '../../types';
import { Button } from '../ui';

interface PlaceCardProps {
  place: Place;
  onSelect: () => void;
  onAddToTemporary?: () => void;
  onAddToSchedule?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  onAddToTemporary,
  onAddToSchedule,
}) => {
  const getCategoryIcon = (category: PlaceCategory): string => {
    const icons: Record<PlaceCategory, string> = {
      [PlaceCategory.ACCOMMODATION]: '🏨',
      [PlaceCategory.RESTAURANT]: '🍽️',
      [PlaceCategory.TOURIST_ATTRACTION]: '🎭',
      [PlaceCategory.SHOPPING]: '🛍️',
      [PlaceCategory.ENTERTAINMENT]: '🎪',
      [PlaceCategory.TRANSPORT]: '🚌',
      [PlaceCategory.OTHER]: '📍',
    };
    return icons[category];
  };

  const getCategoryName = (category: PlaceCategory): string => {
    const names: Record<PlaceCategory, string> = {
      [PlaceCategory.ACCOMMODATION]: '숙박',
      [PlaceCategory.RESTAURANT]: '음식점',
      [PlaceCategory.TOURIST_ATTRACTION]: '관광명소',
      [PlaceCategory.SHOPPING]: '쇼핑',
      [PlaceCategory.ENTERTAINMENT]: '엔터테인먼트',
      [PlaceCategory.TRANSPORT]: '교통',
      [PlaceCategory.OTHER]: '기타',
    };
    return names[category];
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex space-x-4">
        {/* Place Icon/Image */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
            {place.images && place.images.length > 0 ? (
              <img
                src={place.images[0]}
                alt={place.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              getCategoryIcon(place.category)
            )}
          </div>
        </div>

        {/* Place Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900 truncate">
                {place.name}
              </h4>

              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getCategoryIcon(place.category)}{' '}
                  {getCategoryName(place.category)}
                </span>
              </div>

              {place.address && (
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="mr-1">📍</span>
                  {place.address}
                </p>
              )}

              {place.phone && (
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <span className="mr-1">📞</span>
                  {place.phone}
                </p>
              )}

              {place.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {place.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {(onAddToTemporary || onAddToSchedule) && (
              <div className="flex flex-col space-y-2 ml-4">
                {onAddToTemporary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onAddToTemporary();
                    }}
                    className="text-xs"
                  >
                    📦 보관함
                  </Button>
                )}
                {onAddToSchedule && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onAddToSchedule();
                    }}
                    className="text-xs"
                  >
                    📅 일정추가
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>클릭하여 상세정보 보기</span>
          {place.website && (
            <span className="text-blue-600">🔗 웹사이트 보기</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
