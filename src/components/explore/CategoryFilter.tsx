import React from 'react';
import { KakaoPlacesService } from '../../services/kakaoPlacesService';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const categories = KakaoPlacesService.getCategoryGroups();

  return (
    <div className="flex items-center space-x-2 overflow-x-auto">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
        카테고리:
      </span>

      <button
        onClick={() => onCategoryChange('')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          selectedCategory === ''
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        전체
      </button>

      {categories.map((category) => (
        <button
          key={category.code}
          onClick={() => onCategoryChange(category.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center space-x-1 ${
            selectedCategory === category.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
