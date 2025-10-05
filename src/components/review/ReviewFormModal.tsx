import React, { useState, useRef, useEffect } from 'react';
import { ReviewItem, Schedule } from '../../types';
import { ReviewService } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import { Modal, Button } from '../ui';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  userId: string;
  selectedDate?: string;
  selectedPlace?: { placeId: string; schedule: Schedule } | null;
  editingReview?: ReviewItem | null;
  onSaved: (review: ReviewItem) => void;
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  planId,
  userId,
  selectedDate: _selectedDate,
  selectedPlace,
  editingReview,
  onSaved,
}) => {
  const alert = useAlert();
  const isPlaceReview = !!selectedPlace;
  const maxLength = isPlaceReview ? 100 : 1000;
  const maxImages = isPlaceReview ? 2 : 10;

  const [formData, setFormData] = useState({
    content: '',
    rating: 0,
    images: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reviewService = new ReviewService();

  useEffect(() => {
    if (editingReview) {
      setFormData({
        content: editingReview.content,
        rating: editingReview.rating || 0,
        images: editingReview.images || [],
      });
    } else {
      setFormData({
        content: '',
        rating: 0,
        images: [],
      });
    }
  }, [editingReview]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.images.length + files.length > maxImages) {
      alert.warning(`최대 ${maxImages}장까지 첨부할 수 있습니다.`);
      return;
    }

    try {
      const newImages: string[] = [];
      for (const file of files) {
        reviewService.validateImageFile(file);
        const base64 = await reviewService.convertImageToBase64(file);
        newImages.push(base64);
      }
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
      });
    } catch (error) {
      alert.error((error as Error).message);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      alert.warning('내용을 입력해주세요.');
      return;
    }

    if (formData.content.length > maxLength) {
      alert.warning(`내용은 ${maxLength}자 이내로 작성해주세요.`);
      return;
    }

    setLoading(true);

    try {
      let review: ReviewItem;

      if (editingReview) {
        review = await reviewService.updateReview(editingReview.id, {
          content: formData.content.trim(),
          images: formData.images,
          rating: isPlaceReview ? formData.rating || undefined : undefined,
        });
      } else if (isPlaceReview && selectedPlace) {
        review = await reviewService.createPlaceReview(
          planId,
          selectedPlace.placeId,
          userId,
          formData.content.trim(),
          formData.images,
          formData.rating || undefined
        );
      } else {
        review = await reviewService.createDailyReview(
          planId,
          userId,
          formData.content.trim(),
          formData.images
        );
      }

      onSaved(review);
      onClose();
    } catch (error) {
      console.error('Failed to save review:', error);
      alert.error(
        (error as Error).message || '리뷰 저장 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingReview
          ? '리뷰 수정'
          : isPlaceReview
            ? '장소 리뷰 작성'
            : '여행 일기 작성'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 별점 (장소 리뷰만) */}
        {isPlaceReview && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              별점 (선택사항)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-3xl focus:outline-none"
                >
                  <span
                    className={
                      star <= formData.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
              {formData.rating > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: 0 })}
                  className="text-sm text-gray-600 hover:text-gray-800 ml-2"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        )}

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isPlaceReview ? '리뷰 내용' : '여행 일기'} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder={
              isPlaceReview
                ? '이곳에서의 경험을 간단히 적어주세요 (최대 100자)'
                : '오늘 하루는 어땠나요? 자유롭게 작성해보세요 (최대 1,000자)'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={isPlaceReview ? 4 : 10}
            maxLength={maxLength}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.content.length}/{maxLength}
          </p>
        </div>

        {/* 사진 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진 (선택사항, 최대 {maxImages}장)
          </label>

          {/* 업로드된 이미지 미리보기 */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`미리보기 ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 업로드 버튼 */}
          {formData.images.length < maxImages && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                multiple
                className="hidden"
                id="review-image-upload"
              />
              <label
                htmlFor="review-image-upload"
                className="cursor-pointer block text-gray-600 hover:text-gray-900"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-sm">클릭하여 사진 업로드</p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WEBP (최대 5MB, {maxImages}장까지)
                </p>
              </label>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            취소
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {loading ? '저장 중...' : editingReview ? '수정' : '작성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewFormModal;
