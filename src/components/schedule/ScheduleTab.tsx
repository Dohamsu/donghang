import React, { useState, useEffect, useCallback } from 'react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { TravelPlan, Schedule, Place } from '../../types';
import { ScheduleService } from '../../services';
import ScheduleTimeline from './ScheduleTimeline';
import CalendarView from './CalendarView';

interface ScheduleTabProps {
  plan: TravelPlan;
  isOwner: boolean;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ plan, isOwner }) => {
  const [selectedDate, setSelectedDate] = useState(plan.startDate);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const scheduleService = new ScheduleService();

  const travelDates = eachDayOfInterval({
    start: parseISO(plan.startDate),
    end: parseISO(plan.endDate),
  });

  const loadPlaces = useCallback(async (_planId: string): Promise<Place[]> => {
    return [];
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [schedulesData, placesData] = await Promise.all([
        scheduleService.getSchedulesByPlan(plan.id),
        loadPlaces(plan.id),
      ]);

      setSchedules(schedulesData);
      setPlaces(placesData);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id, loadPlaces]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSchedulesForDate = (date: string): Schedule[] => {
    return schedules.filter((schedule) => schedule.date === date);
  };

  const handleSchedulesChange = (updatedSchedules: Schedule[]) => {
    const otherDateSchedules = schedules.filter((s) => s.date !== selectedDate);
    setSchedules([...otherDateSchedules, ...updatedSchedules]);
  };

  const formatDateForTab = (date: Date): string => {
    return format(date, 'M/d (E)', { locale: undefined });
  };

  const getTotalScheduleStats = () => {
    const totalSchedules = schedules.length;
    const totalDuration = schedules.reduce((total, schedule) => {
      const duration = scheduleService.calculateDuration(
        schedule.startTime,
        schedule.endTime
      );
      return total + duration;
    }, 0);

    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    return {
      count: totalSchedules,
      duration: hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`,
    };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">일정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalScheduleStats();
  const selectedDateSchedules = getSchedulesForDate(selectedDate);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">여행 일정</h3>
            <p className="text-sm text-gray-600">
              총 {stats.count}개 일정 · {stats.duration}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📅 캘린더
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 타임라인
              </button>
            </div>

            {plan.confirmed && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                확정된 일정
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' ? (
        <CalendarView
          startDate={plan.startDate}
          endDate={plan.endDate}
          schedules={schedules}
          places={places}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
        />
      ) : (
        <>
          {/* Date Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <div className="flex space-x-1 overflow-x-auto">
                {travelDates.map((date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const daySchedules = getSchedulesForDate(dateString);
                  const isSelected = selectedDate === dateString;

                  return (
                    <button
                      key={dateString}
                      onClick={() => setSelectedDate(dateString)}
                      className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        isSelected
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div>{formatDateForTab(date)}</div>
                        {daySchedules.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {daySchedules.length}개
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <ScheduleTimeline
            planId={plan.id}
            selectedDate={selectedDate}
            places={places}
            schedules={selectedDateSchedules}
            onSchedulesChange={handleSchedulesChange}
            isEditable={isOwner && !plan.confirmed}
          />
        </>
      )}

      {/* Footer Info */}
      {plan.confirmed && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            💡 일정이 확정되어 수정할 수 없습니다. 수정하려면 일정 확정을
            해제해주세요.
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
