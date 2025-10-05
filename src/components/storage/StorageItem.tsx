import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TemporaryPlace, PlaceCategory } from '../../types';

interface StorageItemProps {
  tempPlace: TemporaryPlace;
  onRemove: () => void;
}

const StorageItem: React.FC<StorageItemProps> = ({ tempPlace, onRemove }) => {
  const { place } = tempPlace;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: tempPlace.id,
      data: {
        type: 'storage-item',
        tempPlace,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : {
        opacity: isDragging ? 0.5 : 1,
      };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-md p-2 ${
        isDragging ? 'shadow-lg' : 'hover:shadow-sm'
      } transition-shadow cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center space-x-2">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-base">
            {place.images && place.images.length > 0 ? (
              <img
                src={place.images[0]}
                alt={place.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              getCategoryIcon(place.category)
            )}
          </div>
        </div>

        {/* Place Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate text-xs">
            {place.name}
          </h4>
          {place.address && (
            <p className="text-xs text-gray-500 truncate">
              {place.address.split(' ').slice(0, 2).join(' ')}
            </p>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e?.stopPropagation();
            if (window.confirm('이 장소를 보관함에서 제거하시겠습니까?')) {
              onRemove();
            }
          }}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Drag Preview */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 border-2 border-blue-300 border-dashed rounded-md flex items-center justify-center">
          <span className="text-blue-600 font-medium text-xs">드래그 중</span>
        </div>
      )}
    </div>
  );
};

export default StorageItem;
