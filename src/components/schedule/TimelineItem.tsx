import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimelineItem } from '../../types';
import { Button } from '../ui';

interface TimelineItemProps {
  item: TimelineItem;
  onEdit?: () => void;
  onDelete?: () => void;
  isDraggable?: boolean;
}

const TimelineItemComponent: React.FC<TimelineItemProps> = ({
  item,
  onEdit,
  onDelete,
  isDraggable = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !isDraggable || item.type === 'travel',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (item.type === 'travel') {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-l-2 border-gray-300"></div>
          <span>🚗 {item.travelTime}분 이동</span>
          <div className="w-4 h-4 border-l-2 border-gray-300"></div>
        </div>
      </div>
    );
  }

  const { schedule, place } = item;
  if (!schedule || !place) return null;

  const duration = calculateDuration(schedule.startTime, schedule.endTime);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${
        isDraggable && item.type === 'schedule' ? 'cursor-grab' : ''
      } ${isDragging ? 'shadow-lg' : 'hover:shadow-md'} transition-shadow`}
      {...attributes}
      {...(isDraggable && item.type === 'schedule' ? listeners : {})}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {isDraggable && item.type === 'schedule' && (
              <div className="cursor-grab">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCategoryIcon(place.category)}</span>
              <h4 className="font-medium text-gray-900">{place.name}</h4>
            </div>
          </div>

          <div className="ml-7 space-y-1">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <span>🕐</span>
                <span>
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <span>⏱️</span>
                <span>{formatDuration(duration)}</span>
              </span>
            </div>

            {place.address && (
              <p className="text-sm text-gray-500 flex items-center space-x-1">
                <span>📍</span>
                <span>{place.address}</span>
              </p>
            )}

            {schedule.notes && (
              <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                {schedule.notes}
              </p>
            )}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onEdit();
                }}
              >
                수정
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  if (window.confirm('이 일정을 삭제하시겠습니까?')) {
                    onDelete();
                  }
                }}
              >
                삭제
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function getCategoryIcon(category: string): string {
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
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
}

export default TimelineItemComponent;
