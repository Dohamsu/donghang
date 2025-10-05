import React, { useState, useEffect } from 'react';
import { Schedule, Place } from '../../types';
import { Modal, Button, TimePicker } from '../ui';

interface ScheduleFormProps {
  date: string;
  places: Place[];
  schedule?: Schedule;
  onSubmit: (scheduleData: Partial<Schedule>) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  date,
  places,
  schedule,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    placeId: schedule?.placeId || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    notes: schedule?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!schedule;

  useEffect(() => {
    if (formData.startTime && !formData.endTime) {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const endHours = hours + 1;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
      setFormData((prev) => ({ ...prev, endTime }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.placeId) {
      newErrors.placeId = '장소를 선택해주세요.';
    }
    if (!formData.startTime) {
      newErrors.startTime = '시작 시간을 입력해주세요.';
    }
    if (!formData.endTime) {
      newErrors.endTime = '종료 시간을 입력해주세요.';
    }

    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const scheduleData: Partial<Schedule> = {
      date,
      placeId: formData.placeId,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes || undefined,
    };

    onSubmit(scheduleData);
  };

  const selectedPlace = places.find((p) => p.id === formData.placeId);

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? '일정 수정' : '새 일정 추가'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 장소 선택 */}
        <div>
          <label
            htmlFor="placeId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            장소 *
          </label>
          <select
            id="placeId"
            name="placeId"
            value={formData.placeId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.placeId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">장소를 선택하세요</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {getCategoryIcon(place.category)} {place.name}
              </option>
            ))}
          </select>
          {errors.placeId && (
            <p className="mt-1 text-sm text-red-600">{errors.placeId}</p>
          )}
        </div>

        {/* 선택된 장소 정보 */}
        {selectedPlace && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">
                {getCategoryIcon(selectedPlace.category)}
              </span>
              <span className="font-medium">{selectedPlace.name}</span>
            </div>
            {selectedPlace.address && (
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <span>📍</span>
                <span>{selectedPlace.address}</span>
              </p>
            )}
          </div>
        )}

        {/* 시간 설정 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 시간 *
            </label>
            <TimePicker
              value={formData.startTime}
              onChange={(time) => {
                setFormData((prev) => ({ ...prev, startTime: time }));
                if (errors.startTime) {
                  setErrors((prev) => ({ ...prev, startTime: '' }));
                }
              }}
              placeholder="시작 시간"
              className={errors.startTime ? 'border-red-300' : ''}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 시간 *
            </label>
            <TimePicker
              value={formData.endTime}
              onChange={(time) => {
                setFormData((prev) => ({ ...prev, endTime: time }));
                if (errors.endTime) {
                  setErrors((prev) => ({ ...prev, endTime: '' }));
                }
              }}
              placeholder="종료 시간"
              className={errors.endTime ? 'border-red-300' : ''}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* 예상 소요시간 표시 */}
        {formData.startTime && formData.endTime && !errors.endTime && (
          <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
            예상 소요시간:{' '}
            {calculateDuration(formData.startTime, formData.endTime)}
          </div>
        )}

        {/* 메모 */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            메모
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            placeholder="일정에 대한 메모를 입력하세요..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            취소
          </Button>
          <Button type="submit" className="flex-1">
            {isEditing ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
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

function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = endMinutes - startMinutes;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
}

export default ScheduleForm;
