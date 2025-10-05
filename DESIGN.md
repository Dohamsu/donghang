# Travel Planner - 시스템 설계 및 개선 계획

## 📊 현재 프로젝트 상태 분석

### ✅ 구현 완료 기능

#### 1. 핵심 기능
- **여행 계획 관리**: CRUD 작업, 일정 확정 기능
- **일정 타임라인**: 날짜별 일정 관리, Drag & Drop 지원
- **장소 탐색**: Kakao Places API 연동, 카테고리 필터링
- **임시 저장소**: 장소 임시 저장 및 일정 추가

#### 2. 최근 구현 기능 (Phase 1)
- **예산 & 준비물 탭**:
  - 카테고리별 예산 관리
  - 이미지 첨부 가능한 준비물 체크리스트
  - 진행률 추적 및 통계

- **공유 기능**:
  - 역할 기반 링크 생성 (Collaborator/Viewer)
  - Kakao 공유하기 SDK 연동
  - 클립보드 복사 기능

- **리뷰 시스템**:
  - 장소별 리뷰 (별점, 100자, 2장)
  - 날짜별 여행 일기 (1000자, 10장)
  - 일정 완료 후 작성 가능

#### 3. 기술 스택
- **Frontend**: React 19.2.0, TypeScript 4.9.5
- **Styling**: Tailwind CSS 3.4.18
- **Database**: IndexedDB (LocalDatabase)
- **외부 API**: Kakao Places, Open-Meteo Weather
- **Libraries**: @dnd-kit, date-fns, react-router-dom, uuid

### 🔍 현재 아키텍처 분석

```
src/
├── components/
│   ├── ui/           # 재사용 가능한 UI 컴포넌트
│   ├── budget/       # 예산 & 준비물 관련 컴포넌트
│   ├── explore/      # 장소 탐색 관련 컴포넌트
│   ├── plan/         # 여행 계획 관련 컴포넌트
│   ├── review/       # 리뷰 관련 컴포넌트
│   ├── schedule/     # 일정 관련 컴포넌트
│   ├── share/        # 공유 관련 컴포넌트
│   ├── storage/      # 임시 저장소 관련 컴포넌트
│   └── travel/       # 여행 카드 관련 컴포넌트
├── pages/            # 페이지 컴포넌트
├── services/         # 비즈니스 로직 & API
├── types/            # TypeScript 타입 정의
└── App.tsx           # 메인 애플리케이션
```

**장점**:
- ✅ 명확한 도메인 기반 폴더 구조
- ✅ 관심사의 분리 (UI/Logic/Data)
- ✅ 재사용 가능한 컴포넌트 설계
- ✅ 타입 안정성 (TypeScript)

**개선 필요 영역**:
- ⚠️ 전역 상태 관리 부재 (props drilling 발생 가능)
- ⚠️ 인증/인가 시스템 미구현
- ⚠️ 실시간 협업 기능 부재
- ⚠️ 오프라인 지원 미흡
- ⚠️ 테스트 커버리지 부족

---

## 🎯 Phase 2: 핵심 개선 사항

### 1. 전역 상태 관리 시스템 (우선순위: 높음)

**현재 문제**:
- 컴포넌트 간 데이터 전달이 props drilling으로 이루어짐
- 여러 컴포넌트에서 동일한 데이터를 개별적으로 로딩
- 상태 동기화 문제 발생 가능성

**제안 솔루션**: **Zustand** 도입

**왜 Zustand인가?**
- ✅ 최소한의 보일러플레이트
- ✅ React 19 완벽 지원
- ✅ TypeScript 친화적
- ✅ 학습 곡선 낮음 (Redux보다 간단)
- ✅ 번들 크기 작음 (~1KB)

**구현 계획**:

```typescript
// src/stores/useTravelPlanStore.ts
interface TravelPlanStore {
  // State
  currentPlan: TravelPlan | null;
  plans: TravelPlan[];
  schedules: Schedule[];
  budgetItems: BudgetItem[];
  packingItems: PackingItem[];
  reviews: ReviewItem[];
  loading: boolean;
  error: string | null;

  // Actions
  loadPlan: (planId: string) => Promise<void>;
  updatePlan: (plan: TravelPlan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;

  // Schedule Actions
  addSchedule: (schedule: Schedule) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;

  // Budget Actions
  addBudgetItem: (item: BudgetItem) => Promise<void>;
  updateBudgetItem: (item: BudgetItem) => Promise<void>;
  deleteBudgetItem: (itemId: string) => Promise<void>;

  // Review Actions
  addReview: (review: ReviewItem) => Promise<void>;
  updateReview: (review: ReviewItem) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}
```

**영향받는 컴포넌트**:
- `PlanDetail.tsx` - 중앙 집중식 상태 관리
- `ScheduleTab.tsx` - props drilling 제거
- `BudgetTab.tsx` - 실시간 상태 동기화
- `ReviewTab.tsx` - 리뷰 데이터 일관성 보장

**예상 개선 효과**:
- 🚀 컴포넌트 간 데이터 전달 간소화
- 🚀 불필요한 리렌더링 감소
- 🚀 코드 유지보수성 향상
- 🚀 상태 디버깅 용이

---

### 2. 인증 & 사용자 관리 시스템 (우선순위: 높음)

**현재 문제**:
- User 타입은 정의되어 있으나 실제 인증 로직 없음
- 현재 사용자를 하드코딩으로 가정
- 멤버 관리가 수동으로 이루어짐

**제안 솔루션**: **Firebase Authentication**

**왜 Firebase인가?**
- ✅ 빠른 구현 (이메일/소셜 로그인)
- ✅ 무료 티어 제공
- ✅ React 친화적
- ✅ 보안 관리 자동화
- ✅ 실시간 DB와 쉽게 연동 가능

**구현 기능**:

```typescript
// 1. 인증 방식
- 이메일/비밀번호 로그인
- Google 소셜 로그인
- Kakao 소셜 로그인 (기존 SDK 활용)

// 2. 사용자 프로필
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

// 3. 권한 관리
enum Permission {
  VIEW = 'view',
  EDIT = 'edit',
  MANAGE = 'manage',
  DELETE = 'delete',
}

// 4. 멤버 초대 시스템
interface Invitation {
  id: string;
  planId: string;
  inviterId: string;
  inviteeEmail: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}
```

**새로운 컴포넌트**:
- `LoginPage.tsx` - 로그인 페이지
- `SignupPage.tsx` - 회원가입 페이지
- `ProfilePage.tsx` - 사용자 프로필 관리
- `InvitationModal.tsx` - 멤버 초대 모달
- `MemberManagement.tsx` - 멤버 관리 컴포넌트

**보안 개선**:
- 🔒 Firebase Security Rules 설정
- 🔒 사용자별 데이터 격리
- 🔒 역할 기반 접근 제어 (RBAC)
- 🔒 초대 링크 만료 시간 설정

---

### 3. 실시간 협업 기능 (우선순위: 중간)

**현재 문제**:
- 여러 사용자가 동시에 편집 시 충돌 발생 가능
- 변경 사항이 실시간으로 반영되지 않음
- 누가 무엇을 수정했는지 추적 불가

**제안 솔루션**: **Firebase Realtime Database / Firestore**

**구현 기능**:

```typescript
// 1. 실시간 동기화
- 일정 변경 사항 실시간 반영
- 예산/준비물 체크 실시간 업데이트
- 리뷰 작성 시 즉시 공유

// 2. 활동 로그
interface ActivityLog {
  id: string;
  planId: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'deleted';
  targetType: 'schedule' | 'budget' | 'packing' | 'review';
  targetId: string;
  details: string;
  timestamp: string;
}

// 3. 온라인 사용자 표시
interface OnlineUser {
  userId: string;
  userName: string;
  lastSeen: string;
}

// 4. 댓글 시스템
interface Comment {
  id: string;
  planId: string;
  scheduleId?: string;
  reviewId?: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

**새로운 컴포넌트**:
- `ActivityFeed.tsx` - 활동 로그 피드
- `OnlineUsers.tsx` - 온라인 사용자 표시
- `CommentSection.tsx` - 댓글 섹션
- `NotificationBell.tsx` - 알림 벨

**사용자 경험 개선**:
- 🎯 실시간 협업으로 팀워크 향상
- 🎯 변경 사항 투명성 확보
- 🎯 충돌 최소화
- 🎯 커뮤니케이션 강화

---

### 4. 오프라인 지원 (우선순위: 중간)

**현재 문제**:
- IndexedDB 사용하나 오프라인 동기화 미구현
- 네트워크 오류 시 사용자 경험 저하
- 변경 사항 유실 가능성

**제안 솔루션**: **PWA + Service Worker**

**구현 기능**:

```typescript
// 1. Service Worker 등록
- 정적 리소스 캐싱
- API 응답 캐싱
- 백그라운드 동기화

// 2. 오프라인 큐
interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'schedule' | 'budget' | 'packing' | 'review';
  data: any;
  timestamp: string;
  synced: boolean;
}

// 3. 동기화 상태
interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingOperations: number;
  syncInProgress: boolean;
}
```

**새로운 컴포넌트**:
- `OfflineIndicator.tsx` - 오프라인 상태 표시
- `SyncStatus.tsx` - 동기화 상태 표시
- `OfflineQueue.tsx` - 오프라인 작업 큐 관리

**PWA 기능**:
- 📱 홈 화면에 추가
- 📱 오프라인 사용 가능
- 📱 백그라운드 동기화
- 📱 푸시 알림 (선택)

---

### 5. 사용자 경험 개선 (우선순위: 중간)

**제안 개선 사항**:

#### A. 대시보드 개선
```typescript
// 통계 대시보드
interface DashboardStats {
  totalPlans: number;
  upcomingTrips: number;
  completedTrips: number;
  totalBudget: number;
  totalSpent: number;
}

// 최근 활동
interface RecentActivity {
  planId: string;
  planTitle: string;
  lastModified: string;
  nextSchedule?: Schedule;
}
```

**새로운 컴포넌트**:
- `StatsCard.tsx` - 통계 카드
- `UpcomingTrips.tsx` - 다가오는 여행
- `RecentActivity.tsx` - 최근 활동

#### B. 지도 통합
```typescript
// Kakao Maps 또는 Google Maps 연동
- 일정 경로 시각화
- 장소 위치 표시
- 이동 시간 계산
- 최적 경로 제안
```

**새로운 컴포넌트**:
- `MapView.tsx` - 지도 뷰
- `RouteOptimizer.tsx` - 경로 최적화

#### C. 스마트 추천
```typescript
// AI 기반 추천 (선택사항)
interface Recommendation {
  type: 'place' | 'schedule' | 'budget';
  title: string;
  description: string;
  confidence: number;
  data: any;
}

// 날씨 기반 추천
- 비 예보 시 실내 활동 추천
- 더울 때 시원한 장소 추천
```

**새로운 컴포넌트**:
- `RecommendationCard.tsx` - 추천 카드
- `WeatherAlerts.tsx` - 날씨 알림

#### D. 검색 & 필터링 개선
```typescript
// 고급 검색
interface SearchFilter {
  keyword?: string;
  dateRange?: { start: string; end: string };
  region?: string;
  category?: PlaceCategory[];
  priceRange?: { min: number; max: number };
  tags?: string[];
}
```

**새로운 컴포넌트**:
- `AdvancedSearch.tsx` - 고급 검색
- `FilterPanel.tsx` - 필터 패널

---

### 6. 테스트 커버리지 개선 (우선순위: 낮음)

**현재 문제**:
- 테스트 파일이 거의 없음
- 수동 테스트에 의존
- 리그레션 위험

**제안 솔루션**:

```typescript
// 1. Unit Tests (Jest + React Testing Library)
- 서비스 로직 테스트
- 컴포넌트 렌더링 테스트
- 사용자 인터랙션 테스트

// 2. Integration Tests
- API 연동 테스트
- 데이터 흐름 테스트
- 상태 관리 테스트

// 3. E2E Tests (Playwright 또는 Cypress)
- 주요 사용자 시나리오
- 회원가입/로그인 플로우
- 여행 계획 생성 플로우
```

**목표 커버리지**:
- Unit Tests: 70%+
- Integration Tests: 50%+
- E2E Tests: 주요 시나리오 100%

---

## 📋 구현 우선순위 및 로드맵

### Phase 2-A: 기반 강화 (2-3주)
1. **전역 상태 관리 (Zustand)** - 1주
   - Store 구조 설계
   - 기존 컴포넌트 마이그레이션
   - 성능 최적화

2. **인증 시스템 (Firebase Auth)** - 2주
   - Firebase 프로젝트 설정
   - 이메일/소셜 로그인 구현
   - 사용자 프로필 관리
   - 권한 시스템 구현

### Phase 2-B: 협업 기능 (2-3주)
3. **실시간 협업 (Firestore)** - 2주
   - Firestore 설정 및 마이그레이션
   - 실시간 동기화 구현
   - 활동 로그 시스템
   - 댓글 시스템

4. **멤버 초대 시스템** - 1주
   - 초대 링크 생성
   - 이메일 초대
   - 역할 관리

### Phase 2-C: UX 개선 (2-3주)
5. **대시보드 개선** - 1주
   - 통계 대시보드
   - 최근 활동
   - 다가오는 여행

6. **지도 통합** - 1주
   - Kakao Maps 연동
   - 경로 시각화
   - 이동 시간 계산

7. **오프라인 지원** - 1주
   - Service Worker 구현
   - 오프라인 큐
   - PWA 설정

### Phase 2-D: 품질 개선 (진행 중)
8. **테스트 작성**
   - Unit Tests
   - Integration Tests
   - E2E Tests

---

## 🏗️ 아키텍처 개선안

### 현재 아키텍처
```
Browser
  ↓
React Components (State in Components)
  ↓
Services (Business Logic)
  ↓
IndexedDB (Local Storage)
```

### 개선된 아키텍처
```
Browser
  ↓
React Components
  ↓
Zustand Store (Global State)
  ↓         ↓
Services   Firebase (Auth, Firestore, Storage)
  ↓         ↓
IndexedDB  Cloud Database
  ↓
Service Worker (Offline Support)
```

**주요 개선 사항**:
- ✅ 전역 상태 관리로 데이터 일관성 확보
- ✅ Firebase로 실시간 협업 지원
- ✅ IndexedDB를 오프라인 캐시로 활용
- ✅ Service Worker로 오프라인 경험 개선

---

## 📦 새로운 의존성

```json
{
  "dependencies": {
    // State Management
    "zustand": "^5.0.0",

    // Firebase
    "firebase": "^11.3.0",

    // Maps (선택)
    "@react-google-maps/api": "^2.20.4",

    // PWA
    "workbox-webpack-plugin": "^7.3.0",
    "workbox-window": "^7.3.0"
  },
  "devDependencies": {
    // Testing
    "vitest": "^3.1.0",
    "playwright": "^1.51.0",
    "@vitest/ui": "^3.1.0"
  }
}
```

---

## 🎯 성공 지표

### Phase 2 완료 기준
- ✅ 모든 사용자가 개인 계정으로 로그인 가능
- ✅ 실시간 협업으로 여러 사용자가 동시 편집 가능
- ✅ 오프라인 상태에서도 기본 기능 사용 가능
- ✅ 변경 사항이 자동으로 모든 사용자에게 동기화
- ✅ 지도에서 일정 경로 시각화 가능
- ✅ 테스트 커버리지 50% 이상

### 사용자 경험 개선 목표
- 🎯 초기 로딩 시간 < 2초
- 🎯 상태 동기화 < 100ms
- 🎯 오프라인 → 온라인 전환 시 자동 동기화
- 🎯 모바일 반응형 완벽 지원
- 🎯 접근성 (WCAG 2.1 AA) 준수

---

## 🔄 마이그레이션 전략

### 1. 점진적 마이그레이션
- 한 번에 하나의 기능씩 마이그레이션
- 기존 기능 유지하면서 새 기능 추가
- Feature Flag로 새 기능 테스트

### 2. 데이터 마이그레이션
```typescript
// IndexedDB → Firestore 마이그레이션
interface MigrationTask {
  entity: 'plans' | 'schedules' | 'budgets' | 'reviews';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
}
```

### 3. 롤백 계획
- 각 단계별 롤백 포인트 설정
- 데이터 백업 자동화
- Feature Flag로 새 기능 비활성화 가능

---

## 🚀 다음 단계

1. **즉시 시작 가능**:
   - Zustand 설치 및 Store 구조 설계
   - Firebase 프로젝트 생성
   - 로그인 페이지 스켈레톤 작성

2. **준비 필요**:
   - Firebase 요금제 검토
   - 지도 API 키 발급 (Kakao Maps)
   - 테스트 전략 수립

3. **장기 검토**:
   - AI 기반 추천 시스템
   - 모바일 앱 (React Native)
   - 데이터 분석 대시보드

---

## 📝 결론

현재 Travel Planner는 **기본적인 여행 계획 기능을 모두 갖춘 MVP** 상태입니다. Phase 2에서는 **실제 프로덕션 환경에서 사용 가능한 수준**으로 개선하는 것을 목표로 합니다.

**핵심 가치 제안**:
- 👥 **협업**: 실시간으로 함께 계획하는 여행
- 📱 **접근성**: 언제 어디서나 접근 가능
- 🔒 **신뢰성**: 안전하고 안정적인 데이터 관리
- 🎯 **스마트**: 똑똑한 추천과 최적화

이러한 개선을 통해 Travel Planner는 단순한 개인 프로젝트를 넘어 **실제 사용자에게 가치를 제공하는 서비스**로 발전할 수 있습니다.
