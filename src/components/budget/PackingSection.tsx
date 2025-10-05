import React, { useState, useRef } from 'react';
import { TravelPlan, PackingItem } from '../../types';
import { PackingService } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import { Button, Modal } from '../ui';

interface PackingSectionProps {
  plan: TravelPlan;
  packingItems: PackingItem[];
  canEdit: boolean;
  onItemsChange: (items: PackingItem[]) => void;
}

const PackingSection: React.FC<PackingSectionProps> = ({
  plan,
  packingItems,
  canEdit,
  onItemsChange,
}) => {
  const alert = useAlert();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    imageFile: null as File | null,
    imagePreview: '',
  });
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const packingService = new PackingService();

  const getStats = () => {
    const total = packingItems.length;
    const completed = packingItems.filter((item) => item.completed).length;
    const remaining = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, remaining, progress };
  };

  const handleAddClick = () => {
    setFormData({
      text: '',
      imageFile: null,
      imagePreview: '',
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item: PackingItem) => {
    setFormData({
      text: item.text,
      imageFile: null,
      imagePreview: item.imageUrl || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      packingService.validateImageFile(file);
      const preview = await packingService.convertImageToBase64(file);
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: preview,
      });
    } catch (error) {
      alert.error((error as Error).message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageFile: null,
      imagePreview: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      alert.warning('준비물 이름을 입력해주세요.');
      return;
    }

    if (formData.text.length > 20) {
      alert.warning('준비물 이름은 20자 이내로 입력해주세요.');
      return;
    }

    try {
      if (editingItem) {
        const updated = await packingService.updatePackingItem(editingItem.id, {
          text: formData.text.trim(),
          imageUrl: formData.imagePreview || undefined,
        });
        onItemsChange(
          packingItems.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        const newItem = await packingService.createPackingItem(
          plan.id,
          formData.text.trim(),
          formData.imagePreview || undefined
        );
        onItemsChange([...packingItems, newItem]);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save packing item:', error);
      alert.error(
        (error as Error).message || '준비물 항목 저장 중 오류가 발생했습니다.'
      );
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await packingService.togglePackingItem(id);
      onItemsChange(
        packingItems.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      console.error('Failed to toggle packing item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;

    try {
      await packingService.deletePackingItem(id);
      onItemsChange(packingItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete packing item:', error);
      alert.error('준비물 항목 삭제 중 오류가 발생했습니다.');
    }
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">준비 진행률</h3>
            <p className="text-sm text-gray-600">
              {stats.completed}/{stats.total} 항목 완료
            </p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.progress}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">전체</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-600">완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {stats.remaining}
            </p>
            <p className="text-xs text-gray-600">남음</p>
          </div>
        </div>
      </div>

      {/* Add Button */}
      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleAddClick}>+ 준비물 추가</Button>
        </div>
      )}

      {/* Packing Items List */}
      {packingItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🎒</div>
          <p className="text-gray-600 mb-2">아직 준비물이 없습니다</p>
          {canEdit && (
            <p className="text-sm text-gray-500">
              준비물을 추가하여 체크리스트를 만들어보세요
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {packingItems
            .sort((a, b) => {
              if (a.completed === b.completed) {
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              }
              return a.completed ? 1 : -1;
            })
            .map((item) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  item.completed
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id)}
                      disabled={!canEdit}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Image */}
                  {item.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.text}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900'
                      }`}
                    >
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex-shrink-0 space-x-2">
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
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? '준비물 수정' : '준비물 추가'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              준비물 이름 * (최대 20자)
            </label>
            <input
              type="text"
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              placeholder="예: 선크림, 우산, 카메라"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.text.length}/20
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진 (선택사항, 최대 5MB)
            </label>
            {formData.imagePreview ? (
              <div className="relative">
                <img
                  src={formData.imagePreview}
                  alt="미리보기"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block text-gray-600 hover:text-gray-900"
                >
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm">클릭하여 사진 업로드</p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WEBP (최대 5MB)
                  </p>
                </label>
              </div>
            )}
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

export default PackingSection;
