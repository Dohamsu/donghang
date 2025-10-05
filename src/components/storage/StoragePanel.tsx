import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TemporaryPlace, Place } from '../../types';
import { PlaceService } from '../../services/placeService';
import StorageItem from './StorageItem';
import DropZone from './DropZone';
import { Button } from '../ui';

interface StoragePanelProps {
  planId: string;
  isOpen: boolean;
  onToggle: () => void;
  onAddToSchedule?: (place: Place, date?: string) => void;
}

const StoragePanel: React.FC<StoragePanelProps> = ({
  planId,
  isOpen,
  onToggle,
  onAddToSchedule,
}) => {
  const [temporaryPlaces, setTemporaryPlaces] = useState<TemporaryPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<TemporaryPlace | null>(null);
  const placeService = new PlaceService();

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (isOpen) {
      loadTemporaryPlaces();
    }
  }, [isOpen, planId]);

  const loadTemporaryPlaces = async () => {
    try {
      setLoading(true);
      const places = await placeService.getTemporaryPlaces(planId);
      setTemporaryPlaces(places);
    } catch (error) {
      console.error('Failed to load temporary places:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = temporaryPlaces.find((item) => item.id === active.id);
    setDraggedItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    // 일정에 드롭된 경우
    if (over.id === 'schedule-dropzone') {
      const tempPlace = temporaryPlaces.find((item) => item.id === active.id);
      if (tempPlace && onAddToSchedule) {
        onAddToSchedule(tempPlace.place);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // 드래그 오버 처리
  };

  if (!isOpen) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-colors"
          title="임시보관함 열기"
        >
          <span className="text-xl">📦</span>
          {temporaryPlaces.length > 0 && (
            <span className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {temporaryPlaces.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📦</span>
            <h3 className="text-lg font-medium text-gray-900">임시보관함</h3>
            {temporaryPlaces.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                {temporaryPlaces.length}
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600"
          >
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
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg p-3 animate-pulse"
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
          ) : temporaryPlaces.length === 0 ? (
            <div className="p-4">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  보관함이 비어있습니다
                </h4>
                <p className="text-gray-600 text-sm">
                  탐색 탭에서 장소를 보관함에 추가해보세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {temporaryPlaces.map((tempPlace) => (
                <StorageItem
                  key={tempPlace.id}
                  tempPlace={tempPlace}
                  onRemove={() => handleRemove(tempPlace.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {temporaryPlaces.length > 0 && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <DropZone />
            <Button
              variant="secondary"
              onClick={handleClearAll}
              className="w-full text-sm"
            >
              모두 비우기
            </Button>
          </div>
        )}

        {/* Drag Guide */}
        {draggedItem && (
          <div className="absolute bottom-20 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700 text-center">
              일정 탭으로 드래그하여 일정에 추가하세요
            </p>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onToggle}
      />
    </DndContext>
  );
};

export default StoragePanel;
