import React, { useState, useEffect, useCallback } from 'react';
import { TravelPlan, ReviewItem, Schedule, Place } from '../../types';
import { ReviewService, ScheduleService, PlaceService } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import { Button } from '../ui';
import PlaceReviewCard from './PlaceReviewCard';
import DailyReviewCard from './DailyReviewCard';
import ReviewFormModal from './ReviewFormModal';

interface ReviewTabProps {
  plan: TravelPlan;
  userId: string;
}

const ReviewTab: React.FC<ReviewTabProps> = ({ plan, userId }) => {
  const alert = useAlert();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [places, setPlaces] = useState<Map<string, Place>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    schedule: Schedule;
  } | null>(null);

  const reviewService = new ReviewService();
  const scheduleService = new ScheduleService();
  const placeService = new PlaceService();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reviewsData, schedulesData] = await Promise.all([
        reviewService.getReviewsByPlan(plan.id),
        scheduleService.getSchedulesByPlan(plan.id),
      ]);

      setReviews(reviewsData);
      setSchedules(schedulesData);

      // 장소 정보 로드
      const placeIds = Array.from(
        new Set(schedulesData.map((s) => s.placeId).filter(Boolean))
      );
      const placesMap = new Map<string, Place>();
      for (const placeId of placeIds) {
        const place = await placeService.getPlace(placeId);
        if (place) {
          placesMap.set(placeId, place);
        }
      }
      setPlaces(placesMap);
    } catch (error) {
      console.error('Failed to load review data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 날짜별로 일정 그룹화
  const schedulesByDate = schedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.date]) {
        acc[schedule.date] = [];
      }
      acc[schedule.date].push(schedule);
      return acc;
    },
    {} as Record<string, Schedule[]>
  );

  // 날짜 목록 (여행 기간)
  const dates: string[] = [];
  const start = new Date(plan.startDate);
  const end = new Date(plan.endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  const handleAddPlaceReview = (placeId: string, schedule: Schedule) => {
    setSelectedPlace({ placeId, schedule });
    setSelectedDate('');
    setEditingReview(null);
    setShowFormModal(true);
  };

  const handleAddDailyReview = (date: string) => {
    setSelectedDate(date);
    setSelectedPlace(null);
    setEditingReview(null);
    setShowFormModal(true);
  };

  const handleEditReview = (review: ReviewItem) => {
    setEditingReview(review);
    setShowFormModal(true);
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) return;

    try {
      await reviewService.deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert.error('리뷰 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleReviewSaved = (review: ReviewItem) => {
    if (editingReview) {
      setReviews(reviews.map((r) => (r.id === review.id ? review : r)));
    } else {
      setReviews([review, ...reviews]);
    }
    setShowFormModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  const placeReviews = reviews.filter((r) => r.type === 'place');
  const dailyReviews = reviews.filter((r) => r.type === 'daily');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">리뷰 & 후기</h2>
        <p className="text-gray-600 mt-1">여행의 추억을 기록하고 공유하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {placeReviews.length}
          </p>
          <p className="text-sm text-blue-800">장소 리뷰</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {dailyReviews.length}
          </p>
          <p className="text-sm text-purple-800">일기형 후기</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{reviews.length}</p>
          <p className="text-sm text-green-800">전체 리뷰</p>
        </div>
      </div>

      {/* Content by Date */}
      <div className="space-y-8">
        {dates.map((date) => {
          const daySchedules = schedulesByDate[date] || [];
          const dayReviews = reviews.filter((r) => {
            if (r.type === 'daily') {
              // 일기는 해당 날짜의 리뷰만
              return r.writtenAt.startsWith(date);
            } else {
              // 장소 리뷰는 해당 날짜의 장소들에 대한 리뷰
              return daySchedules.some((s) => s.placeId === r.placeId);
            }
          });

          const canWriteDailyReview = reviewService.canWriteDailyReview(date);
          const hasDailyReview = dailyReviews.some((r) =>
            r.writtenAt.startsWith(date)
          );

          return (
            <div
              key={date}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* Date Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short',
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dayReviews.length}개의 리뷰
                  </p>
                </div>
                {canWriteDailyReview && !hasDailyReview && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddDailyReview(date)}
                  >
                    📝 여행 일기 작성
                  </Button>
                )}
              </div>

              {/* Place Reviews */}
              {daySchedules.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">방문한 장소</h4>
                  <div className="space-y-3">
                    {daySchedules.map((schedule) => {
                      const place = places.get(schedule.placeId);
                      const placeReview = placeReviews.find(
                        (r) => r.placeId === schedule.placeId
                      );
                      const canWrite =
                        reviewService.canWritePlaceReview(schedule);

                      if (!place) return null;

                      return (
                        <div
                          key={schedule.id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {place.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {schedule.startTime} - {schedule.endTime}
                              </p>
                            </div>
                            {canWrite && !placeReview && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleAddPlaceReview(place.id, schedule)
                                }
                              >
                                리뷰 작성
                              </Button>
                            )}
                          </div>
                          {placeReview && (
                            <PlaceReviewCard
                              review={placeReview}
                              currentUserId={userId}
                              onEdit={() => handleEditReview(placeReview)}
                              onDelete={() =>
                                handleDeleteReview(placeReview.id)
                              }
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Daily Review */}
              {dailyReviews
                .filter((r) => r.writtenAt.startsWith(date))
                .map((review) => (
                  <DailyReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={userId}
                    onEdit={() => handleEditReview(review)}
                    onDelete={() => handleDeleteReview(review.id)}
                  />
                ))}

              {/* Empty State */}
              {dayReviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    {canWriteDailyReview
                      ? '이 날의 리뷰를 작성해보세요!'
                      : '일정이 끝나면 리뷰를 작성할 수 있어요'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600 mb-2">아직 작성된 리뷰가 없습니다</p>
          <p className="text-sm text-gray-500">
            여행이 끝난 후 멋진 추억을 기록해보세요!
          </p>
        </div>
      )}

      {/* Review Form Modal */}
      {showFormModal && (
        <ReviewFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          planId={plan.id}
          userId={userId}
          selectedDate={selectedDate}
          selectedPlace={selectedPlace}
          editingReview={editingReview}
          onSaved={handleReviewSaved}
        />
      )}
    </div>
  );
};

export default ReviewTab;
