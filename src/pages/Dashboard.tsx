import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TravelPlan } from '../types';
import { TravelPlanService } from '../services';
import { Button } from '../components/ui';
import TravelPlanCard from '../components/travel/TravelPlanCard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const travelPlanService = new TravelPlanService();

  const loadTravelPlans = useCallback(async () => {
    try {
      setLoading(true);
      const userId = travelPlanService.getCurrentUserId();
      const plans = await travelPlanService.getUserTravelPlans(userId);
      setTravelPlans(
        plans.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
    } catch (err) {
      setError('여행 계획을 불러오는 중 오류가 발생했습니다.');
      console.error('Failed to load travel plans:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTravelPlans();
  }, [loadTravelPlans]);

  const handleCreatePlan = () => {
    navigate('/create-plan');
  };

  const handlePlanClick = (planId: string) => {
    navigate(`/plan/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">여행 계획을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTravelPlans}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">내 여행 계획</h1>
              <p className="mt-1 text-gray-600">
                {travelPlans.length > 0
                  ? `총 ${travelPlans.length}개의 여행 계획이 있어요`
                  : '첫 번째 여행 계획을 만들어보세요!'}
              </p>
            </div>
            <Button onClick={handleCreatePlan} size="lg">
              + 새 여행 계획
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {travelPlans.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-6xl">🧳</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              아직 여행 계획이 없어요
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              새로운 여행 계획을 만들어서 멋진 여행을 준비해보세요. 날짜, 장소,
              일정을 모두 한 곳에서 관리할 수 있어요.
            </p>
            <Button onClick={handleCreatePlan} size="lg">
              첫 번째 여행 계획 만들기
            </Button>
          </div>
        ) : (
          /* Travel Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {travelPlans.map((plan) => (
              <TravelPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => handlePlanClick(plan.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {travelPlans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {travelPlans.length}
                </p>
                <p className="text-sm text-gray-600">전체 계획</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {travelPlans.filter((p) => p.confirmed).length}
                </p>
                <p className="text-sm text-gray-600">확정된 계획</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {travelPlans.filter((p) => !p.confirmed).length}
                </p>
                <p className="text-sm text-gray-600">계획 중</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {travelPlans.reduce(
                    (total, plan) => total + plan.members.length,
                    0
                  )}
                </p>
                <p className="text-sm text-gray-600">총 참여자</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
