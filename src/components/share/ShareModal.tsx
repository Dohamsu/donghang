import React, { useState } from 'react';
import { TravelPlan, UserRole } from '../../types';
import { ShareService, ShareLink } from '../../services';
import { useAlert } from '../../hooks/useAlert';
import { Modal, Button } from '../ui';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TravelPlan;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, plan }) => {
  const alert = useAlert();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareService = new ShareService();

  const handleGenerateLink = () => {
    const link = shareService.generateShareLink(plan.id, selectedRole);
    setShareLink(link);
    setCopySuccess(false);
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await shareService.copyToClipboard(shareLink.url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      alert.error('링크 복사에 실패했습니다.');
    }
  };

  const handleKakaoShare = async () => {
    if (!shareLink) return;

    try {
      await shareService.shareToKakao(plan, shareLink);
    } catch (error) {
      alert.error((error as Error).message);
    }
  };

  const handleClose = () => {
    setShareLink(null);
    setCopySuccess(false);
    onClose();
  };

  const roleOptions = [
    {
      value: UserRole.COLLABORATOR,
      label: '공동 작성자',
      description: '예산과 준비물을 함께 작성할 수 있어요',
      icon: '✏️',
    },
    {
      value: UserRole.VIEWER,
      label: '뷰어',
      description: '여행 계획을 읽기만 할 수 있어요',
      icon: '👀',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="여행 계획 공유하기"
      size="lg"
    >
      <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 링크를 받은 사람은 선택한 권한으로 여행 계획에 참여할 수 있어요
          </p>
        </div>

        {/* 권한 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            공유 권한 선택
          </label>
          <div className="space-y-2">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRole(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRole === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                  {selectedRole === option.value && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 링크 생성 버튼 */}
        {!shareLink && (
          <Button onClick={handleGenerateLink} className="w-full">
            링크 생성하기
          </Button>
        )}

        {/* 생성된 링크 */}
        {shareLink && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공유 링크
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareLink.url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  onClick={handleCopyLink}
                  variant={copySuccess ? 'secondary' : 'primary'}
                >
                  {copySuccess ? '✓ 복사됨' : '복사'}
                </Button>
              </div>
            </div>

            {/* 공유 방법 */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleKakaoShare}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors"
              >
                <span>💬</span>
                <span>카카오톡 공유</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
              >
                <span>🔗</span>
                <span>링크 복사</span>
              </button>
            </div>

            {/* 새 링크 생성 */}
            <button
              onClick={handleGenerateLink}
              className="w-full text-sm text-blue-600 hover:text-blue-800"
            >
              새로운 링크 생성
            </button>
          </div>
        )}

        {/* 안내사항 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-2 font-medium">참고사항</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>
              • 관리자(Owner)는 일정 확정/해제 및 공유 관리 권한을 가집니다
            </li>
            <li>• 공동 작성자는 예산과 준비물을 함께 관리할 수 있습니다</li>
            <li>• 뷰어는 모든 내용을 읽기만 할 수 있습니다</li>
            <li>• 링크는 여러 번 생성할 수 있으며, 각각 독립적입니다</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
