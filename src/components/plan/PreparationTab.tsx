import React from 'react';
import { TravelPlan } from '../../types';
import { Button } from '../ui';

interface PreparationTabProps {
  plan: TravelPlan;
  isOwner: boolean;
  onConfirmPlan: () => void;
  onUnconfirmPlan: () => void;
}

const PreparationTab: React.FC<PreparationTabProps> = ({
  plan,
  isOwner,
  onConfirmPlan,
  onUnconfirmPlan,
}) => {
  const getDaysUntilTrip = () => {
    const today = new Date();
    const startDate = new Date(plan.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilTrip = getDaysUntilTrip();

  return (
    <div className="p-6 space-y-6">
      {/* 여행 개요 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          ✈️ 여행 개요
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {daysUntilTrip > 0 ? daysUntilTrip : 0}일
            </p>
            <p className="text-sm text-gray-600">
              {daysUntilTrip > 0 ? '남음' : '여행 기간'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {plan.members.length}명
            </p>
            <p className="text-sm text-gray-600">참여자</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {plan.confirmed ? '확정' : '계획중'}
            </p>
            <p className="text-sm text-gray-600">상태</p>
          </div>
        </div>
      </div>

      {/* 상태별 안내 */}
      {!plan.confirmed ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h4 className="font-medium text-yellow-800 mb-2">📋 계획 단계</h4>
          <p className="text-yellow-700 mb-4">
            여행 일정을 계획하고 확정해주세요. 확정 후에는 예산과 준비물을
            관리할 수 있습니다.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">기본 정보 입력 완료</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-yellow-500">○</span>
              <span className="text-sm text-gray-700">일정 계획 (진행 중)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">○</span>
              <span className="text-sm text-gray-400">일정 확정</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-400">○</span>
              <span className="text-sm text-gray-400">예산 및 준비물 관리</span>
            </div>
          </div>
          {isOwner && (
            <div className="mt-4">
              <Button onClick={onConfirmPlan} size="sm">
                일정 확정하기
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="font-medium text-green-800 mb-2">
            🎉 계획 확정 완료!
          </h4>
          <p className="text-green-700 mb-4">
            여행 일정이 확정되었습니다. 이제 예산과 준비물을 관리하고 여행을
            준비해보세요!
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">기본 정보 입력 완료</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">일정 계획 완료</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500">✓</span>
              <span className="text-sm text-gray-700">일정 확정 완료</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-500">→</span>
              <span className="text-sm text-blue-700 font-medium">
                예산 및 준비물 관리 가능
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="mt-4">
              <Button variant="secondary" onClick={onUnconfirmPlan} size="sm">
                확정 해제
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">📅</div>
          <p className="font-medium text-gray-900">일정 관리</p>
          <p className="text-xs text-gray-500">타임라인 보기</p>
        </button>
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center">
          <div className="text-2xl mb-2">🔍</div>
          <p className="font-medium text-gray-900">장소 탐색</p>
          <p className="text-xs text-gray-500">관광지 찾기</p>
        </button>
        <button
          className={`p-4 border rounded-lg text-center transition-shadow ${
            plan.confirmed
              ? 'bg-white border-gray-200 hover:shadow-md'
              : 'bg-gray-50 border-gray-100 cursor-not-allowed'
          }`}
          disabled={!plan.confirmed}
        >
          <div className="text-2xl mb-2">💰</div>
          <p
            className={`font-medium ${plan.confirmed ? 'text-gray-900' : 'text-gray-400'}`}
          >
            예산 관리
          </p>
          <p
            className={`text-xs ${plan.confirmed ? 'text-gray-500' : 'text-gray-400'}`}
          >
            비용 계산
          </p>
        </button>
        <button
          className={`p-4 border rounded-lg text-center transition-shadow ${
            plan.confirmed
              ? 'bg-white border-gray-200 hover:shadow-md'
              : 'bg-gray-50 border-gray-100 cursor-not-allowed'
          }`}
          disabled={!plan.confirmed}
        >
          <div className="text-2xl mb-2">🎒</div>
          <p
            className={`font-medium ${plan.confirmed ? 'text-gray-900' : 'text-gray-400'}`}
          >
            준비물
          </p>
          <p
            className={`text-xs ${plan.confirmed ? 'text-gray-500' : 'text-gray-400'}`}
          >
            체크리스트
          </p>
        </button>
      </div>

      {/* 팀 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">👥 팀 멤버</h4>
        <div className="space-y-3">
          {plan.members.map((member) => (
            <div key={member.id} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreparationTab;
