import React from 'react';
import { CardProps } from '../../types/ui';

const Card: React.FC<CardProps> = ({ className = '', onClick, children }) => {
  const baseClasses =
    'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden';
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:shadow-lg transition-shadow'
    : '';
  const cardClasses = `${baseClasses} ${interactiveClasses} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
