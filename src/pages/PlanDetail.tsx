import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TravelPlan, UserRole } from '../types';
import { TabItem } from '../types/ui';
import {
  TravelPlanService,
  WeatherService,
  ScheduleService,
  ShareService,
} from '../services';
import { Button, Tabs } from '../components/ui';
import { useAlert } from '../hooks/useAlert';
import PreparationTab from '../components/plan/PreparationTab';
import ScheduleTab from '../components/schedule/ScheduleTab';
import ExploreTab from '../components/explore/ExploreTab';
import StorageTab from '../components/storage/StorageTab';
import BudgetTab from '../components/budget/BudgetTab';
import ShareModal from '../components/share/ShareModal';
import ReviewTab from '../components/review/ReviewTab';

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const alert = useAlert();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('preparation');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedRole, setSharedRole] = useState<UserRole | null>(null);

  const travelPlanService = new TravelPlanService();
  const scheduleService = new ScheduleService();
  const shareService = new ShareService();

  const sensors = useSensors(useSensor(PointerSensor));

  const loadPlan = useCallback(async (planId: string) => {
    try {
      setLoading(true);

      // 공유 링크 파라미터 확인
      const shareParams = shareService.parseShareParams(searchParams);

      const planData = await travelPlanService.getTravelPlan(planId);
      if (!planData) {
        setError('여행 계획을 찾을 수 없습니다.');
        return;
      }

      // 공유 링크로 접근한 경우
      if (shareParams?.shareId) {
        // 확정된 계획만 공유 가능
        if (!planData.confirmed) {
          setError('이 여행 계획은 아직 확정되지 않았습니다.');
          return;
        }

        // 공유 role 설정
        setSharedRole(shareParams.role || UserRole.VIEWER);
        setPlan(planData);

        // 공유 링크로 접근했다는 알림
        alert.success(`${shareParams.role === UserRole.COLLABORATOR ? '공동 작성자' : '뷰어'}로 참여했습니다!`);
        return;
      }

      // 일반 접근: 권한 체크 - 멤버인지 확인
      const currentUserId = travelPlanService.getCurrentUserId();
      const isMember = planData.members.some(
        (member) => member.id === currentUserId
      );

      if (!isMember) {
        setError('이 여행 계획에 접근할 권한이 없습니다.');
        return;
      }

      setPlan(planData);
    } catch (err) {
      setError('여행 계획을 불러오는 중 오류가 발생했습니다.');
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (id) {
      loadPlan(id);
    } else {
      navigate('/');
    }
  }, [id, navigate, loadPlan]);

  const handleConfirmPlan = async () => {
    if (!plan) return;

    try {
      const updatedPlan = await travelPlanService.confirmTravelPlan(plan.id);
      setPlan(updatedPlan);
    } catch (err) {
      console.error('Failed to confirm plan:', err);
    }
  };

  const handleUnconfirmPlan = async () => {
    if (!plan) return;

    try {
      const updatedPlan = await travelPlanService.unconfirmTravelPlan(plan.id);
      setPlan(updatedPlan);
    } catch (err) {
      console.error('Failed to unconfirm plan:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getDuration = () => {
    if (!plan) return '';
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}일`;
  };

  const getCurrentUserRole = () => {
    if (!plan) return null;

    // 공유 링크로 접근한 경우 공유 role 반환
    if (sharedRole) return sharedRole;

    // 일반 접근: 멤버의 role 반환
    const currentUserId = travelPlanService.getCurrentUserId();
    const member = plan.members.find((m) => m.id === currentUserId);
    return member?.role || null;
  };

  const isOwner = getCurrentUserRole() === UserRole.OWNER;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Storage에서 Calendar로 드롭
    if (
      active.data.current?.type === 'storage-item' &&
      over.data.current?.type === 'calendar-date'
    ) {
      const tempPlace = active.data.current.tempPlace;
      const targetDate = over.data.current.date;

      try {
        await scheduleService.createSchedule(
          plan!.id,
          targetDate,
          tempPlace.place.id,
          '09:00', // 기본 시작 시간
          '10:00', // 기본 종료 시간
          0 // order will be updated by timeline
        );

        alert.success('일정에 추가되었습니다!');

        // 일정 탭으로 이동
        setActiveTab('schedule');
      } catch (error) {
        console.error('Failed to add schedule:', error);
        alert.error('일정 추가에 실패했습니다.');
      }
    }
  };

  // 탭 설정
  const tabs: TabItem[] = [
    {
      id: 'preparation',
      label: '여행준비계획',
      icon: '📋',
      disabled: false,
    },
    {
      id: 'schedule',
      label: '일정',
      icon: '📅',
      disabled: false,
    },
    {
      id: 'explore',
      label: '탐색하기',
      icon: '🔍',
      disabled: plan?.confirmed || false,
    },
    {
      id: 'storage',
      label: '임시보관함',
      icon: '📦',
      disabled: plan?.confirmed || false,
    },
    {
      id: 'budget',
      label: '예산/준비물',
      icon: '💰',
      disabled: !plan?.confirmed,
    },
    {
      id: 'review',
      label: '리뷰/후기',
      icon: '📝',
      disabled: !plan?.confirmed || new Date() < new Date(plan?.endDate || ''),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preparation':
        return plan ? (
          <PreparationTab
            plan={plan}
            isOwner={isOwner}
            onConfirmPlan={handleConfirmPlan}
            onUnconfirmPlan={handleUnconfirmPlan}
          />
        ) : null;
      case 'schedule':
        return plan ? <ScheduleTab plan={plan} isOwner={isOwner} /> : null;
      case 'explore':
        return plan ? <ExploreTab plan={plan} isOwner={isOwner} /> : null;
      case 'storage':
        return plan ? <StorageTab plan={plan} isOwner={isOwner} /> : null;
      case 'budget':
        return plan ? (
          <BudgetTab plan={plan} userRole={getCurrentUserRole()!} />
        ) : null;
      case 'review':
        return plan ? (
          <ReviewTab
            plan={plan}
            userId={travelPlanService.getCurrentUserId()}
          />
        ) : null;
      default:
        return null;
    }
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

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || '여행 계획을 찾을 수 없습니다.'}
          </p>
          <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {plan.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      plan.confirmed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {plan.confirmed ? '확정됨' : '계획 중'}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-600">
                    {formatDate(plan.startDate)} - {formatDate(plan.endDate)} (
                    {getDuration()})
                  </p>
                  <p className="text-gray-600">📍 {plan.region}</p>

                  {/* 멤버 정보 */}
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {plan.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white"
                          title={`${member.name} (${member.role})`}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {plan.members.length > 5 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                          +{plan.members.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {plan.members.length}명
                    </span>
                  </div>
                </div>
              </div>

              {/* 날씨 정보 */}
              {plan.weatherSummary && (
                <div className="bg-blue-50 rounded-lg p-4 min-w-[300px]">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    날씨 정보
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">최고</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {WeatherService.formatTemperature(
                            plan.weatherSummary.maxTemp
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">최저</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {WeatherService.formatTemperature(
                            plan.weatherSummary.minTemp
                          )}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">미세먼지</p>
                        <p className="text-sm font-medium text-gray-700">
                          {plan.weatherSummary.dust}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {plan.weatherSummary.description}
                  </p>
                </div>
              )}
            </div>

            {/* 공유 링크 접근 표시 */}
            {sharedRole && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔗 공유 링크로 참여 중입니다 (
                  {sharedRole === UserRole.COLLABORATOR
                    ? '공동 작성자'
                    : '뷰어'}
                  )
                </p>
              </div>
            )}

            {/* 액션 버튼 (Owner만) */}
            {isOwner && !sharedRole && (
              <div className="mt-6 flex space-x-3">
                {plan.confirmed ? (
                  <Button variant="secondary" onClick={handleUnconfirmPlan}>
                    일정 확정 해제
                  </Button>
                ) : (
                  <Button onClick={handleConfirmPlan}>일정 확정</Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => setShowShareModal(true)}
                  disabled={!plan.confirmed}
                >
                  공유하기
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white min-h-[500px]">{renderTabContent()}</div>
        </div>

        {/* 공유 모달 */}
        {plan && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            plan={plan}
          />
        )}
      </div>
    </DndContext>
  );
};

export default PlanDetail;
