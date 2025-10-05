import React from 'react';
import { TravelPlan } from '../../types';
import { Card } from '../ui';
import { WeatherService } from '../../services';

interface TravelPlanCardProps {
  plan: TravelPlan;
  onClick: () => void;
}

const TravelPlanCard: React.FC<TravelPlanCardProps> = ({ plan, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  const getDuration = () => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}일`;
  };

  return (
    <Card onClick={onClick} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {plan.title}
          </h3>
          <p className="text-gray-600">
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)} (
            {getDuration()})
          </p>
          <p className="text-sm text-gray-500 mt-1">{plan.region}</p>
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              plan.confirmed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {plan.confirmed ? '확정됨' : '계획 중'}
          </span>
        </div>
      </div>

      {/* 날씨 정보 */}
      {plan.weatherSummary && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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

      {/* 멤버 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {plan.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {plan.members.length > 3 && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
                +{plan.members.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">{plan.members.length}명</span>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">
            {new Date(plan.updatedAt).toLocaleDateString('ko-KR')} 업데이트
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TravelPlanCard;
