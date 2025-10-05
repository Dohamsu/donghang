import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Schedule, Place, TimelineItem } from '../../types';
import { ScheduleService } from '../../services';
import TimelineItemComponent from './TimelineItem';
import ScheduleForm from './ScheduleForm';
import { Button } from '../ui';

interface ScheduleTimelineProps {
  planId: string;
  selectedDate: string;
  places: Place[];
  schedules: Schedule[];
  onSchedulesChange: (schedules: Schedule[]) => void;
  isEditable: boolean;
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  planId,
  selectedDate,
  places,
  schedules,
  onSchedulesChange,
  isEditable,
}) => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const scheduleService = new ScheduleService();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const timeline = scheduleService.createTimeline(schedules, places);
    setTimelineItems(timeline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedules, places]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = timelineItems.findIndex((item) => item.id === active.id);
      const newIndex = timelineItems.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(timelineItems, oldIndex, newIndex);
        setTimelineItems(newItems);

        const scheduleItems = newItems.filter(
          (item) => item.type === 'schedule'
        );
        const reorderedSchedules = scheduleItems.map((item, index) => ({
          ...item.schedule!,
          order: index,
        }));

        try {
          const scheduleIds = reorderedSchedules.map((s) => s.id);
          await scheduleService.reorderSchedules(
            planId,
            selectedDate,
            scheduleIds
          );
          onSchedulesChange(reorderedSchedules);
        } catch (error) {
          console.error('Failed to reorder schedules:', error);
          setTimelineItems(scheduleService.createTimeline(schedules, places));
        }
      }
    }
  };

  const handleAddSchedule = async (scheduleData: Partial<Schedule>) => {
    if (
      !scheduleData.date ||
      !scheduleData.placeId ||
      !scheduleData.startTime ||
      !scheduleData.endTime
    ) {
      return;
    }

    try {
      const newOrder = schedules.length;
      const newSchedule = await scheduleService.createSchedule(
        planId,
        scheduleData.date,
        scheduleData.placeId,
        scheduleData.startTime,
        scheduleData.endTime,
        newOrder
      );

      const updatedSchedules = [...schedules, newSchedule];
      onSchedulesChange(updatedSchedules);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleEditSchedule = async (scheduleData: Partial<Schedule>) => {
    if (!editingSchedule) return;

    try {
      const updatedSchedule = await scheduleService.updateSchedule(
        editingSchedule.id,
        scheduleData
      );

      const updatedSchedules = schedules.map((s) =>
        s.id === editingSchedule.id ? updatedSchedule : s
      );
      onSchedulesChange(updatedSchedules);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await scheduleService.deleteSchedule(scheduleId);
      const updatedSchedules = schedules.filter((s) => s.id !== scheduleId);
      onSchedulesChange(updatedSchedules);
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const calculateTotalDuration = () => {
    return schedules.reduce((total, schedule) => {
      const duration = scheduleService.calculateDuration(
        schedule.startTime,
        schedule.endTime
      );
      return total + duration;
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  if (schedules.length === 0 && !showAddForm) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            아직 일정이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 일정을 추가하여 여행 계획을 시작해보세요.
          </p>
          {isEditable && (
            <Button onClick={() => setShowAddForm(true)}>
              첫 일정 추가하기
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {new Date(selectedDate).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </h3>
          <p className="text-sm text-gray-600">
            총 {schedules.length}개 일정 ·{' '}
            {formatDuration(calculateTotalDuration())}
          </p>
        </div>
        {isEditable && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            일정 추가
          </Button>
        )}
      </div>

      {/* Timeline */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={timelineItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {timelineItems.map((item) => (
              <TimelineItemComponent
                key={item.id}
                item={item}
                onEdit={
                  item.type === 'schedule' && isEditable
                    ? () => setEditingSchedule(item.schedule!)
                    : undefined
                }
                onDelete={
                  item.type === 'schedule' && isEditable
                    ? () => handleDeleteSchedule(item.schedule!.id)
                    : undefined
                }
                isDraggable={isEditable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Form Modal */}
      {showAddForm && (
        <ScheduleForm
          date={selectedDate}
          places={places}
          onSubmit={handleAddSchedule}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form Modal */}
      {editingSchedule && (
        <ScheduleForm
          date={selectedDate}
          places={places}
          schedule={editingSchedule}
          onSubmit={handleEditSchedule}
          onCancel={() => setEditingSchedule(null)}
        />
      )}
    </div>
  );
};

export default ScheduleTimeline;
