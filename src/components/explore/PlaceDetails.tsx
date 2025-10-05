import React from 'react';
import { Place, PlaceCategory } from '../../types';
import { Button } from '../ui';

interface PlaceDetailsProps {
  place: Place;
  onClose: () => void;
  onAddToTemporary?: (place: Place) => void;
  onAddToSchedule?: (place: Place) => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  place,
  onClose,
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

  const openInMaps = () => {
    const url = `https://maps.google.com/?q=${place.latitude},${place.longitude}`;
    window.open(url, '_blank');
  };

  const openWebsite = () => {
    if (place.website) {
      window.open(place.website, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">장소 상세정보</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Place Image */}
        {place.images && place.images.length > 0 ? (
          <div className="mb-4">
            <img
              src={place.images[0]}
              alt={place.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-6xl mb-4">
            {getCategoryIcon(place.category)}
          </div>
        )}

        {/* Place Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {place.name}
            </h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {getCategoryIcon(place.category)}{' '}
              {getCategoryName(place.category)}
            </div>
          </div>

          {place.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">설명</h4>
              <p className="text-gray-600 leading-relaxed">
                {place.description}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-3">
            {place.address && (
              <div className="flex items-start space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="font-medium text-gray-900">주소</p>
                  <p className="text-gray-600">{place.address}</p>
                </div>
              </div>
            )}

            {place.phone && (
              <div className="flex items-start space-x-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-medium text-gray-900">전화번호</p>
                  <a
                    href={`tel:${place.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {place.phone}
                  </a>
                </div>
              </div>
            )}

            {place.website && (
              <div className="flex items-start space-x-3">
                <span className="text-lg">🔗</span>
                <div>
                  <p className="font-medium text-gray-900">웹사이트</p>
                  <button
                    onClick={openWebsite}
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    홈페이지 바로가기
                  </button>
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="flex items-start space-x-3">
              <span className="text-lg">🗺️</span>
              <div>
                <p className="font-medium text-gray-900">위치</p>
                <p className="text-gray-600 text-sm">
                  위도: {place.latitude.toFixed(6)}, 경도:{' '}
                  {place.longitude.toFixed(6)}
                </p>
                <button
                  onClick={openInMaps}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  지도에서 보기
                </button>
              </div>
            </div>
          </div>

          {/* Additional Images */}
          {place.images && place.images.length > 1 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">추가 이미지</h4>
              <div className="grid grid-cols-2 gap-2">
                {place.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${place.name} ${index + 2}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(onAddToTemporary || onAddToSchedule) && (
        <div className="p-4 border-t border-gray-200 space-y-2">
          {onAddToSchedule && (
            <Button onClick={() => onAddToSchedule(place)} className="w-full">
              📅 일정에 추가
            </Button>
          )}
          {onAddToTemporary && (
            <Button
              variant="secondary"
              onClick={() => onAddToTemporary(place)}
              className="w-full"
            >
              📦 임시보관함에 추가
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;
