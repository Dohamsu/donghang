import { TravelPlan, UserRole } from '../types';

export interface ShareLink {
  id: string;
  planId: string;
  role: UserRole;
  url: string;
  createdAt: string;
  expiresAt?: string;
}

export class ShareService {
  private baseUrl: string;

  constructor() {
    // 개발 환경에서는 localhost, 프로덕션에서는 실제 도메인
    this.baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
  }

  /**
   * 공유 링크 생성
   */
  public generateShareLink(
    planId: string,
    role: UserRole = UserRole.VIEWER
  ): ShareLink {
    const shareLink: ShareLink = {
      id: this.generateShareId(),
      planId,
      role,
      url: `${this.baseUrl}/plan/${planId}?share=${this.generateShareId()}&role=${role}`,
      createdAt: new Date().toISOString(),
    };

    return shareLink;
  }

  /**
   * 카카오톡 공유하기
   */
  public async shareToKakao(
    plan: TravelPlan,
    shareLink: ShareLink
  ): Promise<void> {
    // Kakao SDK가 로드되어 있는지 확인
    if (!window.Kakao) {
      throw new Error('카카오 SDK가 로드되지 않았습니다.');
    }

    if (!window.Kakao.isInitialized()) {
      // 카카오 앱 키는 환경변수에서 가져오기 (실제 배포 시 설정 필요)
      const kakaoKey = import.meta.env.VITE_KAKAO_APP_KEY;
      if (!kakaoKey) {
        throw new Error('카카오 앱 키가 설정되지 않았습니다.');
      }
      window.Kakao.init(kakaoKey);
    }

    // 날짜 포맷팅
    const startDate = new Date(plan.startDate).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
    const endDate = new Date(plan.endDate).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });

    // 역할 한글 변환
    const roleText = this.getRoleDisplayName(shareLink.role);

    try {
      await window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `🌴 ${plan.title}`,
          description: `${startDate} - ${endDate}\n📍 ${plan.region}\n\n함께 여행을 준비해요!`,
          imageUrl:
            'https://mud-kage.kakao.com/dn/Q2iNx/btqgeRgV54P/VLdBs9cvyn8BJXB3o7N8UK/kakaolink40_original.png',
          link: {
            mobileWebUrl: shareLink.url,
            webUrl: shareLink.url,
          },
        },
        buttons: [
          {
            title: `${roleText}로 참여하기`,
            link: {
              mobileWebUrl: shareLink.url,
              webUrl: shareLink.url,
            },
          },
        ],
      });
    } catch (error) {
      console.error('카카오톡 공유 실패:', error);
      throw new Error('카카오톡 공유 중 오류가 발생했습니다.');
    }
  }

  /**
   * URL 복사
   */
  public async copyToClipboard(url: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw err;
        }
      }
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      throw new Error('링크 복사 중 오류가 발생했습니다.');
    }
  }

  /**
   * 역할 표시명 가져오기
   */
  private getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      [UserRole.OWNER]: '관리자',
      [UserRole.COLLABORATOR]: '공동 작성자',
      [UserRole.VIEWER]: '뷰어',
    };
    return roleNames[role] || '뷰어';
  }

  /**
   * 공유 ID 생성
   */
  private generateShareId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * URL에서 공유 정보 파싱
   */
  public parseShareParams(searchParams: URLSearchParams): {
    shareId?: string;
    role?: UserRole;
  } | null {
    const shareId = searchParams.get('share');
    const roleParam = searchParams.get('role');

    if (!shareId) {
      return null;
    }

    let role: UserRole = UserRole.VIEWER;
    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      role = roleParam as UserRole;
    }

    return { shareId, role };
  }

  /**
   * 링크 공유 가능 여부 확인
   */
  public canShare(plan: TravelPlan): { canShare: boolean; reason?: string } {
    if (!plan.confirmed) {
      return {
        canShare: false,
        reason: '일정이 확정된 후에 공유할 수 있습니다.',
      };
    }

    return { canShare: true };
  }
}

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}
