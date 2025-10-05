import React, { useState, useEffect } from 'react';
import { Button } from '../ui';

interface PlaceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = '장소를 검색하세요...',
  loading = false,
}) => {
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // 디바운스 검색
  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (value.trim()) {
      const timeout = setTimeout(() => {
        onSearch(value.trim());
      }, 500);
      setDebounceTimeout(timeout);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-16 flex items-center pr-2"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
        )}

        {/* Search Button */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button
            type="submit"
            size="sm"
            loading={loading}
            disabled={!value.trim() || loading}
            className="rounded-l-none"
          >
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {/* Quick Search Suggestions */}
      <div className="mt-2 flex flex-wrap gap-2">
        {['맛집', '카페', '관광지', '숙박', '쇼핑'].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              onChange(suggestion);
              onSearch(suggestion);
            }}
            className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </form>
  );
};

export default PlaceSearch;
