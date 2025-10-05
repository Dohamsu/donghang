import React, { useState } from 'react';
import { TravelPlan, BudgetItem, BudgetCategory } from '../../types';
import { BudgetService } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import { Button, Modal, DatePicker } from '../ui';

interface BudgetSectionProps {
  plan: TravelPlan;
  budgetItems: BudgetItem[];
  canEdit: boolean;
  onItemsChange: (items: BudgetItem[]) => void;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({
  plan,
  budgetItems,
  canEdit,
  onItemsChange,
}) => {
  const alert = useAlert();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: BudgetCategory.OTHER,
    day: '',
  });
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const budgetService = new BudgetService();

  const categoryLabels: Record<BudgetCategory, string> = {
    [BudgetCategory.ACCOMMODATION]: '숙박',
    [BudgetCategory.FOOD]: '식비',
    [BudgetCategory.TRANSPORT]: '교통',
    [BudgetCategory.ACTIVITY]: '활동/관광',
    [BudgetCategory.SHOPPING]: '쇼핑',
    [BudgetCategory.OTHER]: '기타',
  };

  const categoryColors: Record<BudgetCategory, string> = {
    [BudgetCategory.ACCOMMODATION]: 'bg-purple-100 text-purple-800',
    [BudgetCategory.FOOD]: 'bg-orange-100 text-orange-800',
    [BudgetCategory.TRANSPORT]: 'bg-blue-100 text-blue-800',
    [BudgetCategory.ACTIVITY]: 'bg-green-100 text-green-800',
    [BudgetCategory.SHOPPING]: 'bg-pink-100 text-pink-800',
    [BudgetCategory.OTHER]: 'bg-gray-100 text-gray-800',
  };

  const getTotalBudget = () => {
    return budgetItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const getCategoryTotals = () => {
    const totals: Record<BudgetCategory, number> = {
      [BudgetCategory.ACCOMMODATION]: 0,
      [BudgetCategory.FOOD]: 0,
      [BudgetCategory.TRANSPORT]: 0,
      [BudgetCategory.ACTIVITY]: 0,
      [BudgetCategory.SHOPPING]: 0,
      [BudgetCategory.OTHER]: 0,
    };

    budgetItems.forEach((item) => {
      totals[item.category] += item.amount;
    });

    return totals;
  };

  const handleAddClick = () => {
    setFormData({
      amount: '',
      description: '',
      category: BudgetCategory.OTHER,
      day: '',
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: BudgetItem) => {
    setFormData({
      amount: item.amount.toString(),
      description: item.description,
      category: item.category,
      day: item.day || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert.warning('올바른 금액을 입력해주세요.');
      return;
    }

    try {
      if (editingItem) {
        const updated = await budgetService.updateBudgetItem(editingItem.id, {
          amount,
          description: formData.description,
          category: formData.category,
          day: formData.day || undefined,
        });
        onItemsChange(
          budgetItems.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const newItem = await budgetService.createBudgetItem(
          plan.id,
          amount,
          formData.description,
          formData.category,
          formData.day || undefined
        );
        onItemsChange([...budgetItems, newItem]);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save budget item:', error);
      alert.error('예산 항목 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;

    try {
      await budgetService.deleteBudgetItem(id);
      onItemsChange(budgetItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete budget item:', error);
      alert.error('예산 항목 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const categoryTotals = getCategoryTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <p className="text-sm text-blue-800 font-medium mb-1">총 예산</p>
          <p className="text-3xl font-bold text-blue-900">
            {formatCurrency(getTotalBudget())}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <p className="text-sm text-green-800 font-medium mb-1">항목 수</p>
          <p className="text-3xl font-bold text-green-900">
            {budgetItems.length}개
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <p className="text-sm text-purple-800 font-medium mb-1">1인당 예산</p>
          <p className="text-3xl font-bold text-purple-900">
            {formatCurrency(
              plan.members.length > 0
                ? Math.round(getTotalBudget() / plan.members.length)
                : 0
            )}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {budgetItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">카테고리별 예산</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => {
              if (total === 0) return null;
              return (
                <div
                  key={category}
                  className={`rounded-lg p-4 ${categoryColors[category as BudgetCategory]}`}
                >
                  <p className="text-sm font-medium mb-1">
                    {categoryLabels[category as BudgetCategory]}
                  </p>
                  <p className="text-lg font-bold">{formatCurrency(total)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Button */}
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleAddClick}>+ 예산 항목 추가</Button>
        </div>
      )}

      {/* Budget Items List */}
      {budgetItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-gray-600 mb-2">아직 예산 항목이 없습니다</p>
          {canEdit && (
            <p className="text-sm text-gray-500">
              예산 항목을 추가하여 여행 경비를 관리하세요
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {budgetItems
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[item.category]}`}
                      >
                        {categoryLabels[item.category]}
                      </span>
                      {item.day && (
                        <span className="text-xs text-gray-500">
                          📅 {item.day}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 font-medium">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    {canEdit && (
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? '예산 항목 수정' : '예산 항목 추가'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              금액 *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="금액을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="예: 호텔 숙박비"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as BudgetCategory,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 (선택사항)
            </label>
            <DatePicker
              selected={formData.day ? new Date(formData.day) : null}
              onChange={(date) =>
                setFormData({
                  ...formData,
                  day: date ? date.toISOString().split('T')[0] : '',
                })
              }
              minDate={new Date(plan.startDate)}
              maxDate={new Date(plan.endDate)}
              placeholderText="날짜 선택"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" className="flex-1">
              {editingItem ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetSection;
