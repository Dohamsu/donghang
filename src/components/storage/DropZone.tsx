import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  id = 'schedule-dropzone',
  children,
  className = '',
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        border-2 border-dashed rounded-lg p-4 text-center transition-colors
        ${
          isOver
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-gray-50 text-gray-600'
        }
        ${className}
      `}
    >
      {children || (
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl">{isOver ? '📅' : '⬆️'}</div>
          <p className="text-sm font-medium">
            {isOver ? '일정에 추가됩니다' : '여기로 드래그하여 일정 추가'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DropZone;
