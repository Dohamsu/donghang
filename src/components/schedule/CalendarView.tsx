import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { Schedule, Place } from '../../types';

interface CalendarViewProps {
  startDate: string;
  endDate: string;
  schedules: Schedule[];
  places: Place[];
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  startDate,
  endDate,
  schedules,
  places,
  onDateSelect,
  selectedDate,
}) => {
  const travelDates = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  const getSchedulesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return schedules.filter((s) => s.date === dateString);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return dateString === selectedDate;
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">여행 일정 캘린더</h3>
        <p className="text-sm text-gray-600 mt-1">
          날짜를 클릭하여 상세 일정을 확인하거나, 임시보관함에서 장소를
          드래그하여 일정을 추가하세요.
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {/* Week Day Headers */}
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${
              index === 0
                ? 'text-red-600'
                : index === 6
                  ? 'text-blue-600'
                  : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}

        {/* Empty cells for alignment */}
        {Array.from({ length: parseISO(startDate).getDay() }).map(
          (_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          )
        )}

        {/* Date Cells */}
        {travelDates.map((date) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const daySchedules = getSchedulesForDate(date);
          const dayOfWeek = date.getDay();

          return (
            <CalendarDateCell
              key={dateString}
              date={dateString}
              displayDate={date}
              schedules={daySchedules}
              places={places}
              isSelected={isSelected(date)}
              isToday={isToday(date)}
              isSunday={dayOfWeek === 0}
              isSaturday={dayOfWeek === 6}
              onClick={() => onDateSelect(dateString)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span>선택된 날짜</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
          <span>오늘</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>드롭 가능</span>
        </div>
      </div>
    </div>
  );
};

interface CalendarDateCellProps {
  date: string;
  displayDate: Date;
  schedules: Schedule[];
  places: Place[];
  isSelected: boolean;
  isToday: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  onClick: () => void;
}

const CalendarDateCell: React.FC<CalendarDateCellProps> = ({
  date,
  displayDate,
  schedules,
  places,
  isSelected,
  isToday,
  isSunday,
  isSaturday,
  onClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-date-${date}`,
    data: {
      type: 'calendar-date',
      date,
    },
  });

  const getCategoryIcon = (placeId: string) => {
    const place = places.find((p) => p.id === placeId);
    if (!place) return '📍';

    const icons: Record<string, string> = {
      accommodation: '🏨',
      restaurant: '🍽️',
      tourist_attraction: '🎭',
      shopping: '🛍️',
      entertainment: '🎪',
      transport: '🚌',
      other: '📍',
    };
    return icons[place.category] || '📍';
  };

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`
        aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'}
        ${isOver ? 'border-green-500 bg-green-50 scale-105' : ''}
        ${isToday && !isSelected ? 'border-green-400 bg-green-50' : ''}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Date Number */}
        <div
          className={`text-sm font-medium mb-1 ${
            isSunday
              ? 'text-red-600'
              : isSaturday
                ? 'text-blue-600'
                : 'text-gray-900'
          }`}
        >
          {format(displayDate, 'd')}
        </div>

        {/* Schedule Count */}
        {schedules.length > 0 && (
          <div className="flex-1 flex flex-col space-y-1 overflow-hidden">
            {schedules.slice(0, 2).map((schedule) => (
              <div
                key={schedule.id}
                className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                title={places.find((p) => p.id === schedule.placeId)?.name}
              >
                {getCategoryIcon(schedule.placeId)}{' '}
                {schedule.startTime.slice(0, 5)}
              </div>
            ))}
            {schedules.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{schedules.length - 2}
              </div>
            )}
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-50 rounded-lg">
            <span className="text-green-700 font-medium text-sm">드롭</span>
          </div>
        )}

        {/* Empty State */}
        {schedules.length === 0 && !isOver && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
            일정 없음
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
