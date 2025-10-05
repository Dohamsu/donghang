import React from 'react';
import { ReviewItem } from '../../types';

interface PlaceReviewCardProps {
  review: ReviewItem;
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}

const PlaceReviewCard: React.FC<PlaceReviewCardProps> = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const isAuthor = review.authorId === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {review.rating && (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < review.rating! ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
            <span className="text-xs text-gray-500">
              {new Date(review.writtenAt).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap">{review.content}</p>
        </div>
        {isAuthor && (
          <div className="ml-4 flex space-x-2">
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

      {/* Images */}
      {review.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`리뷰 이미지 ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaceReviewCard;
