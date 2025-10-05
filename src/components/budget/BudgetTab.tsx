import React, { useState, useEffect, useCallback } from 'react';
import { TravelPlan, BudgetItem, PackingItem, UserRole } from '../../types';
import { BudgetService, PackingService } from '../../services';
import BudgetSection from './BudgetSection';
import PackingSection from './PackingSection';

interface BudgetTabProps {
  plan: TravelPlan;
  userRole: UserRole;
}

const BudgetTab: React.FC<BudgetTabProps> = ({ plan, userRole }) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'budget' | 'packing'>(
    'budget'
  );

  const budgetService = new BudgetService();
  const packingService = new PackingService();

  const canEdit =
    userRole === UserRole.OWNER || userRole === UserRole.COLLABORATOR;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgets, packings] = await Promise.all([
        budgetService.getBudgetItemsByPlan(plan.id),
        packingService.getPackingItemsByPlan(plan.id),
      ]);
      setBudgetItems(budgets);
      setPackingItems(packings);
    } catch (error) {
      console.error('Failed to load budget/packing data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBudgetItemsChange = (items: BudgetItem[]) => {
    setBudgetItems(items);
  };

  const handlePackingItemsChange = (items: PackingItem[]) => {
    setPackingItems(items);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">예산 & 준비물</h2>
          <p className="text-gray-600 mt-1">
            {canEdit
              ? '여행 예산과 준비물을 관리하세요'
              : '예산과 준비물을 확인하세요 (읽기 전용)'}
          </p>
        </div>
      </div>

      {/* Section Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex">
        <button
          onClick={() => setActiveSection('budget')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'budget'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          💰 예산 관리
        </button>
        <button
          onClick={() => setActiveSection('packing')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeSection === 'packing'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          🎒 준비물 체크리스트
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeSection === 'budget' ? (
          <BudgetSection
            plan={plan}
            budgetItems={budgetItems}
            canEdit={canEdit}
            onItemsChange={handleBudgetItemsChange}
          />
        ) : (
          <PackingSection
            plan={plan}
            packingItems={packingItems}
            canEdit={canEdit}
            onItemsChange={handlePackingItemsChange}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetTab;
