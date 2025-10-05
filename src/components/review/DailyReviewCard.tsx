import React from 'react';
import { ReviewItem } from '../../types';

interface DailyReviewCardProps {
  review: ReviewItem;
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}

const DailyReviewCard: React.FC<DailyReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const isAuthor = review.authorId === currentUserId;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">📔</span>
            여행 일기
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(review.writtenAt).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {isAuthor && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              수정
            </button>
            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
        {review.content}
      </p>

      {/* Images */}
      {review.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`일기 이미지 ${index + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyReviewCard;
