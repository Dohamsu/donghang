# Travel Planner - 프로젝트 인덱스

> 여행 계획을 효율적으로 관리하는 협업형 웹 애플리케이션

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.18-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [컴포넌트 가이드](#-컴포넌트-가이드)
- [서비스 레이어](#-서비스-레이어)
- [타입 정의](#-타입-정의)
- [시작하기](#-시작하기)
- [개발 가이드](#-개발-가이드)
- [관련 문서](#-관련-문서)

---

## 🎯 프로젝트 개요

Travel Planner는 개인 또는 그룹의 여행 계획을 체계적으로 관리할 수 있는 웹 애플리케이션입니다. 일정 관리, 장소 탐색, 예산 관리, 준비물 체크리스트, 리뷰 작성 등 여행의 전 과정을 하나의 플랫폼에서 관리할 수 있습니다.

### 핵심 가치
- **협업 중심**: 여러 사람이 함께 계획을 수정하고 공유
- **직관적 UI**: 드래그 앤 드롭, 타임라인 뷰 등 사용하기 쉬운 인터페이스
- **실용성**: Kakao Places API 연동으로 실제 장소 검색 및 추가
- **완성도**: 예산 관리부터 여행 후 리뷰까지 전체 여행 라이프사이클 지원

---

## ✨ 주요 기능

### 1. 여행 계획 관리
- 여행 일정 생성, 수정, 삭제
- 날짜별 일정 타임라인 뷰
- 일정 확정 기능
- 여행 지역 설정 및 날씨 정보 자동 조회

### 2. 일정 관리 (Schedule)
- **캘린더 뷰**: 월별 일정 한눈에 보기
- **타임라인 뷰**: 날짜별 시간순 일정 표시
- **Drag & Drop**: 일정 순서 재배치
- **시간 설정**: 장소별 시작/종료 시간 및 이동 시간(ETA) 관리
- **메모 기능**: 각 일정에 메모 추가

### 3. 장소 탐색 (Explore)
- **Kakao Places API** 연동 실시간 장소 검색
- 카테고리별 필터링 (숙소, 식당, 관광지, 쇼핑, 엔터테인먼트, 교통)
- 장소 상세 정보 (주소, 전화번호, 웹사이트)
- 임시 저장소에 장소 보관 후 일정 추가

### 4. 예산 & 준비물 (Budget & Packing)
- **예산 관리**: 카테고리별 지출 항목 추가 및 총액 집계
- **준비물 체크리스트**: 이미지 첨부 가능한 준비물 관리
- **진행률 추적**: 준비물 완료율 시각화

### 5. 리뷰 시스템 (Review)
- **장소별 리뷰**: 방문한 장소에 대한 별점 및 후기 (100자 제한, 사진 2장)
- **날짜별 여행 일기**: 하루 전체에 대한 종합 후기 (1000자 제한, 사진 10장)
- 일정 완료 후에만 작성 가능

### 6. 공유 기능 (Share)
- **역할 기반 링크 생성**: Collaborator(편집 가능) / Viewer(읽기 전용)
- **Kakao 공유하기**: SDK 연동으로 카카오톡 공유
- **클립보드 복사**: 링크 즉시 복사

---

## 🛠 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 프레임워크 |
| **TypeScript** | 4.9.5 | 타입 안정성 |
| **Vite** | 7.1.9 | 빌드 도구 |
| **Tailwind CSS** | 3.4.18 | 스타일링 |

### 라이브러리
| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| `@dnd-kit/core` | 6.3.1 | 드래그 앤 드롭 |
| `react-router-dom` | 7.9.3 | 라우팅 |
| `react-datepicker` | 8.7.0 | 날짜 선택 |
| `date-fns` | 4.1.0 | 날짜 포맷팅 |
| `uuid` | 13.0.0 | 고유 ID 생성 |
| `@iconify/react` | 6.0.2 | 아이콘 |

### 데이터베이스
- **IndexedDB**: 로컬 데이터 저장 (LocalDatabase 클래스로 추상화)

### 외부 API
- **Kakao Places API**: 장소 검색 및 정보 조회
- **Open-Meteo Weather API**: 날씨 정보 조회

### 개발 도구
| 도구 | 버전 | 용도 |
|------|------|------|
| ESLint | - | 코드 품질 검사 |
| Prettier | 3.6.2 | 코드 포맷팅 |
| PostCSS | 8.5.6 | CSS 후처리 |
| Autoprefixer | 10.4.21 | CSS 벤더 프리픽스 |

---

## 📁 프로젝트 구조

```
travel-planner/
├── public/                     # 정적 파일
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   │   │   ├── AlertModal.tsx      # 알림 모달
│   │   │   ├── Button.tsx          # 버튼 컴포넌트
│   │   │   ├── Card.tsx            # 카드 레이아웃
│   │   │   ├── DatePicker.tsx      # 날짜 선택기
│   │   │   ├── Modal.tsx           # 모달 컴포넌트
│   │   │   ├── Navigation.tsx      # 내비게이션 바
│   │   │   ├── Tabs.tsx            # 탭 컴포넌트
│   │   │   ├── TimePicker.tsx      # 시간 선택기
│   │   │   └── index.ts            # UI 컴포넌트 export
│   │   │
│   │   ├── budget/            # 예산 & 준비물 관련
│   │   │   ├── BudgetSection.tsx   # 예산 섹션
│   │   │   ├── BudgetTab.tsx       # 예산 탭
│   │   │   └── PackingSection.tsx  # 준비물 섹션
│   │   │
│   │   ├── explore/           # 장소 탐색 관련
│   │   │   ├── CategoryFilter.tsx  # 카테고리 필터
│   │   │   ├── ExploreTab.tsx      # 장소 탐색 탭
│   │   │   ├── PlaceCard.tsx       # 장소 카드
│   │   │   ├── PlaceDetails.tsx    # 장소 상세
│   │   │   ├── PlaceList.tsx       # 장소 목록
│   │   │   └── PlaceSearch.tsx     # 장소 검색
│   │   │
│   │   ├── plan/              # 여행 계획 관련
│   │   │   └── PreparationTab.tsx  # 준비 탭 (예산 & 준비물)
│   │   │
│   │   ├── review/            # 리뷰 관련
│   │   │   ├── DailyReviewCard.tsx # 날짜별 리뷰
│   │   │   ├── PlaceReviewCard.tsx # 장소별 리뷰
│   │   │   ├── ReviewFormModal.tsx # 리뷰 작성 모달
│   │   │   └── ReviewTab.tsx       # 리뷰 탭
│   │   │
│   │   ├── schedule/          # 일정 관련
│   │   │   ├── CalendarView.tsx    # 캘린더 뷰
│   │   │   ├── ScheduleForm.tsx    # 일정 추가/수정 폼
│   │   │   ├── ScheduleTab.tsx     # 일정 탭
│   │   │   ├── ScheduleTimeline.tsx # 타임라인 뷰
│   │   │   └── TimelineItem.tsx    # 타임라인 항목
│   │   │
│   │   ├── share/             # 공유 관련
│   │   │   └── ShareModal.tsx      # 공유 모달
│   │   │
│   │   ├── storage/           # 임시 저장소 관련
│   │   │   ├── DropZone.tsx        # 드롭존
│   │   │   ├── StorageItem.tsx     # 저장소 항목
│   │   │   ├── StoragePanel.tsx    # 저장소 패널
│   │   │   └── StorageTab.tsx      # 저장소 탭
│   │   │
│   │   └── travel/            # 여행 카드 관련
│   │       └── TravelPlanCard.tsx  # 여행 계획 카드
│   │
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── CreatePlan.tsx          # 계획 생성 페이지
│   │   ├── Dashboard.tsx           # 대시보드 (홈)
│   │   └── PlanDetail.tsx          # 계획 상세 페이지
│   │
│   ├── services/              # 비즈니스 로직 & API
│   │   ├── budgetService.ts        # 예산 관리 서비스
│   │   ├── database.ts             # IndexedDB 추상화 레이어
│   │   ├── kakaoPlacesService.ts   # Kakao Places API
│   │   ├── packingService.ts       # 준비물 관리 서비스
│   │   ├── placeService.ts         # 장소 관리 서비스
│   │   ├── reviewService.ts        # 리뷰 관리 서비스
│   │   ├── scheduleService.ts      # 일정 관리 서비스
│   │   ├── shareService.ts         # 공유 기능 서비스
│   │   ├── travelPlanService.ts    # 여행 계획 서비스
│   │   ├── weatherService.ts       # 날씨 API 서비스
│   │   └── index.ts                # 서비스 export
│   │
│   ├── contexts/              # React Context
│   │   └── AlertContext.tsx        # 알림 컨텍스트
│   │
│   ├── hooks/                 # Custom Hooks
│   │   └── useAlert.ts             # 알림 훅
│   │
│   ├── types/                 # TypeScript 타입 정의
│   │   ├── index.ts                # 핵심 타입 정의
│   │   ├── api.ts                  # API 타입 정의
│   │   └── ui.ts                   # UI 타입 정의
│   │
│   ├── App.tsx                # 메인 앱 컴포넌트
│   ├── index.tsx              # 앱 진입점
│   ├── index.css              # 전역 스타일
│   └── vite-env.d.ts          # Vite 타입 정의
│
├── build/                     # 빌드 출력 폴더
├── node_modules/              # 의존성 패키지
│
├── .eslintrc.json             # ESLint 설정
├── .gitignore                 # Git ignore 설정
├── .prettierrc                # Prettier 설정
├── index.html                 # HTML 템플릿
├── package.json               # 프로젝트 메타데이터
├── postcss.config.js          # PostCSS 설정
├── tailwind.config.js         # Tailwind 설정
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
│
├── README.md                  # 기본 README
├── DESIGN.md                  # 시스템 설계 문서
├── COLORS.md                  # 컬러 가이드
└── PROJECT_INDEX.md           # 프로젝트 인덱스 (이 문서)
```

---

## 🧩 컴포넌트 가이드

### UI 컴포넌트 (`src/components/ui/`)

재사용 가능한 기본 UI 컴포넌트 모음입니다.

#### `Button.tsx`
버튼 컴포넌트로 다양한 변형을 지원합니다.
- **Props**: `variant`, `size`, `disabled`, `onClick`, `children`
- **Variants**: `primary`, `secondary`, `danger`, `ghost`
- **사용 예시**:
  ```tsx
  <Button variant="primary" onClick={handleSave}>저장</Button>
  ```

#### `Card.tsx`
카드 레이아웃 컴포넌트입니다.
- **Props**: `title`, `subtitle`, `children`, `actions`
- **사용 예시**:
  ```tsx
  <Card title="여행 계획" subtitle="서울 3박 4일">
    {content}
  </Card>
  ```

#### `Modal.tsx`
모달 다이얼로그 컴포넌트입니다.
- **Props**: `isOpen`, `onClose`, `title`, `children`, `footer`
- **사용 예시**:
  ```tsx
  <Modal isOpen={isOpen} onClose={handleClose} title="일정 추가">
    <ScheduleForm />
  </Modal>
  ```

#### `Tabs.tsx`
탭 네비게이션 컴포넌트입니다.
- **Props**: `tabs`, `activeTab`, `onTabChange`
- **사용 예시**:
  ```tsx
  <Tabs
    tabs={['일정', '탐색', '준비', '리뷰', '저장소']}
    activeTab={activeTab}
    onTabChange={setActiveTab}
  />
  ```

#### `DatePicker.tsx` / `TimePicker.tsx`
날짜 및 시간 선택 컴포넌트입니다.
- **Props**: `value`, `onChange`, `placeholder`, `minDate`, `maxDate`

#### `Navigation.tsx`
앱 전체 네비게이션 바입니다.
- **기능**: 로고, 페이지 링크, 사용자 메뉴

#### `AlertModal.tsx`
알림 메시지 모달입니다.
- **Props**: `message`, `type`, `onClose`
- **Types**: `success`, `error`, `warning`, `info`

### 도메인별 컴포넌트

#### 예산 & 준비물 (`src/components/budget/`)
- **`BudgetTab.tsx`**: 예산과 준비물을 관리하는 메인 탭
- **`BudgetSection.tsx`**: 예산 항목 관리 섹션
- **`PackingSection.tsx`**: 준비물 체크리스트 섹션

#### 장소 탐색 (`src/components/explore/`)
- **`ExploreTab.tsx`**: 장소 탐색 메인 탭
- **`PlaceSearch.tsx`**: 장소 검색 입력 및 결과
- **`CategoryFilter.tsx`**: 카테고리 필터 버튼
- **`PlaceList.tsx`**: 검색 결과 장소 목록
- **`PlaceCard.tsx`**: 개별 장소 카드
- **`PlaceDetails.tsx`**: 장소 상세 정보 모달

#### 일정 관리 (`src/components/schedule/`)
- **`ScheduleTab.tsx`**: 일정 관리 메인 탭
- **`CalendarView.tsx`**: 월별 캘린더 뷰
- **`ScheduleTimeline.tsx`**: 날짜별 타임라인 뷰
- **`TimelineItem.tsx`**: 타임라인 개별 항목
- **`ScheduleForm.tsx`**: 일정 추가/수정 폼

#### 리뷰 시스템 (`src/components/review/`)
- **`ReviewTab.tsx`**: 리뷰 메인 탭
- **`PlaceReviewCard.tsx`**: 장소별 리뷰 카드
- **`DailyReviewCard.tsx`**: 날짜별 리뷰 카드
- **`ReviewFormModal.tsx`**: 리뷰 작성 모달

#### 임시 저장소 (`src/components/storage/`)
- **`StorageTab.tsx`**: 저장소 메인 탭
- **`StoragePanel.tsx`**: 저장소 패널
- **`StorageItem.tsx`**: 저장소 개별 항목
- **`DropZone.tsx`**: 드래그 앤 드롭 영역

#### 공유 기능 (`src/components/share/`)
- **`ShareModal.tsx`**: 공유 링크 생성 및 전송 모달

#### 여행 계획 (`src/components/travel/`)
- **`TravelPlanCard.tsx`**: 대시보드의 여행 계획 카드

---

## 🔧 서비스 레이어

서비스 레이어는 비즈니스 로직과 데이터 액세스를 캡슐화합니다.

### `database.ts`
IndexedDB를 추상화한 `LocalDatabase` 클래스입니다.

**주요 메서드**:
- `getAllTravelPlans()`: 모든 여행 계획 조회
- `getTravelPlan(id)`: 특정 여행 계획 조회
- `saveTravelPlan(plan)`: 여행 계획 저장
- `deleteTravelPlan(id)`: 여행 계획 삭제
- `getSchedulesByPlanId(planId)`: 특정 계획의 일정 조회
- `saveSchedule(schedule)`: 일정 저장
- `deleteSchedule(id)`: 일정 삭제
- 기타 Budget, Packing, Review, Place 관련 메서드

### `travelPlanService.ts`
여행 계획 CRUD 작업을 처리합니다.

**주요 함수**:
- `createTravelPlan(data)`: 새 여행 계획 생성
- `updateTravelPlan(plan)`: 여행 계획 업데이트
- `deleteTravelPlan(id)`: 여행 계획 삭제
- `confirmTravelPlan(id)`: 여행 계획 확정

### `scheduleService.ts`
일정 관리 로직을 처리합니다.

**주요 함수**:
- `createSchedule(data)`: 새 일정 생성
- `updateSchedule(schedule)`: 일정 업데이트
- `deleteSchedule(id)`: 일정 삭제
- `reorderSchedules(planId, schedules)`: 일정 순서 재배치
- `groupSchedulesByDate(schedules)`: 날짜별 일정 그룹핑

### `kakaoPlacesService.ts`
Kakao Places API 연동 서비스입니다.

**주요 함수**:
- `searchPlaces(keyword, category, region)`: 장소 검색
- `convertToPlace(kakaoPlace)`: Kakao 장소 → Place 타입 변환

**필요 설정**:
```javascript
// public/index.html에 Kakao JavaScript SDK 추가
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services"></script>
```

### `weatherService.ts`
Open-Meteo Weather API 연동 서비스입니다.

**주요 함수**:
- `getWeatherSummary(region, startDate, endDate)`: 날씨 요약 조회
- `geocodeLocation(location)`: 지역명 → 위도/경도 변환

### `budgetService.ts`
예산 관리 로직을 처리합니다.

**주요 함수**:
- `createBudgetItem(data)`: 예산 항목 생성
- `updateBudgetItem(item)`: 예산 항목 업데이트
- `deleteBudgetItem(id)`: 예산 항목 삭제
- `calculateTotalBudget(items)`: 총 예산 계산

### `packingService.ts`
준비물 체크리스트 관리 로직입니다.

**주요 함수**:
- `createPackingItem(data)`: 준비물 항목 생성
- `updatePackingItem(item)`: 준비물 항목 업데이트
- `deletePackingItem(id)`: 준비물 항목 삭제
- `togglePackingItemCompleted(id)`: 완료 상태 토글

### `reviewService.ts`
리뷰 관리 로직을 처리합니다.

**주요 함수**:
- `createReview(data)`: 리뷰 생성
- `updateReview(review)`: 리뷰 업데이트
- `deleteReview(id)`: 리뷰 삭제
- `getReviewsByPlanId(planId)`: 계획별 리뷰 조회

### `placeService.ts`
장소 데이터 관리 로직입니다.

**주요 함수**:
- `savePlace(place)`: 장소 저장
- `deletePlace(id)`: 장소 삭제
- `getPlaceById(id)`: 장소 조회

### `shareService.ts`
공유 기능 관련 로직입니다.

**주요 함수**:
- `generateShareLink(planId, role)`: 공유 링크 생성
- `shareToKakao(plan, shareUrl)`: 카카오톡 공유
- `copyToClipboard(text)`: 클립보드 복사

---

## 📘 타입 정의

TypeScript 타입은 `src/types/` 폴더에 정의되어 있습니다.

### 핵심 타입 (`types/index.ts`)

#### `TravelPlan`
```typescript
interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  region: string;
  weatherSummary?: WeatherSummary;
  confirmed: boolean;
  ownerId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}
```

#### `Schedule`
```typescript
interface Schedule {
  id: string;
  planId: string;
  date: string;
  placeId: string;
  startTime: string;
  endTime: string;
  eta?: number;         // 이동 시간 (분)
  order: number;
  notes?: string;
}
```

#### `Place`
```typescript
interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  description?: string;
  images: string[];
  address?: string;
  phone?: string;
  website?: string;
}
```

#### `BudgetItem`
```typescript
interface BudgetItem {
  id: string;
  planId: string;
  day?: string;
  placeId?: string;
  amount: number;
  description: string;
  category: BudgetCategory;
  createdAt: string;
}
```

#### `PackingItem`
```typescript
interface PackingItem {
  id: string;
  planId: string;
  text: string;
  imageUrl?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### `ReviewItem`
```typescript
interface ReviewItem {
  id: string;
  planId: string;
  placeId?: string;      // 장소 리뷰 시
  content: string;
  images: string[];
  writtenAt: string;
  authorId: string;
  rating?: number;       // 장소 리뷰 시 별점
  type: ReviewType;      // 'place' | 'daily'
}
```

### Enums

#### `UserRole`
```typescript
enum UserRole {
  OWNER = 'owner',
  COLLABORATOR = 'collaborator',
  VIEWER = 'viewer',
}
```

#### `PlaceCategory`
```typescript
enum PlaceCategory {
  ACCOMMODATION = 'accommodation',
  RESTAURANT = 'restaurant',
  TOURIST_ATTRACTION = 'tourist_attraction',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  TRANSPORT = 'transport',
  OTHER = 'other',
}
```

#### `BudgetCategory`
```typescript
enum BudgetCategory {
  ACCOMMODATION = 'accommodation',
  FOOD = 'food',
  TRANSPORT = 'transport',
  ACTIVITY = 'activity',
  SHOPPING = 'shopping',
  OTHER = 'other',
}
```

#### `ReviewType`
```typescript
enum ReviewType {
  PLACE = 'place',      // 장소별 리뷰
  DAILY = 'daily',      // 날짜별 여행 일기
}
```

---

## 🚀 시작하기

### 사전 요구사항
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상

### 설치

1. **저장소 클론**
   ```bash
   git clone https://github.com/Dohamsu/donghang.git
   cd travel-planner
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **Kakao API 키 설정**

   `public/index.html` 파일에서 Kakao JavaScript SDK의 `appkey`를 본인의 키로 변경합니다.

   ```html
   <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services"></script>
   ```

   Kakao Developers에서 앱을 생성하고 JavaScript 키를 발급받으세요:
   https://developers.kakao.com/

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 로 접속합니다.

### 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일은 `build/` 폴더에 생성됩니다.

### 빌드 미리보기

```bash
npm run preview
```

---

## 🧑‍💻 개발 가이드

### 스크립트 명령어

```json
{
  "dev": "vite",                              // 개발 서버 실행
  "build": "vite build",                      // 프로덕션 빌드
  "preview": "vite preview",                  // 빌드 미리보기
  "lint": "eslint src --ext .ts,.tsx",        // 린트 검사
  "lint:fix": "eslint src --ext .ts,.tsx --fix", // 린트 자동 수정
  "format": "prettier --write src/**/*.{ts,tsx,css,json}", // 코드 포맷팅
  "typecheck": "tsc --noEmit"                 // 타입 검사
}
```

### 코드 스타일 가이드

#### Tailwind CSS 사용
프로젝트는 Tailwind CSS를 사용하며, 커스텀 컬러 팔레트가 정의되어 있습니다.

**컬러 사용 예시**:
```tsx
// Primary 색상
<button className="bg-trip-primary hover:bg-trip-primaryDark text-white">
  확인
</button>

// Secondary 색상
<button className="bg-trip-gray-200 hover:bg-trip-gray-300 text-trip-text-primary">
  취소
</button>
```

자세한 컬러 가이드는 [`COLORS.md`](./COLORS.md) 참조.

#### 컴포넌트 작성 규칙
1. **함수형 컴포넌트** 사용 (React Hooks)
2. **TypeScript** 타입 명시
3. **Props 인터페이스** 정의
4. **기본값 설정** (optional props)

**예시**:
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  // 컴포넌트 로직
};
```

#### 서비스 함수 작성 규칙
1. **비동기 함수**는 `async/await` 사용
2. **에러 처리** 필수
3. **명확한 함수명** 사용 (동사 + 명사)
4. **JSDoc 주석** 추가 권장

**예시**:
```typescript
/**
 * 새로운 여행 계획을 생성합니다.
 * @param data - 여행 계획 생성 데이터
 * @returns 생성된 여행 계획
 */
export async function createTravelPlan(
  data: Partial<TravelPlan>
): Promise<TravelPlan> {
  try {
    const plan: TravelPlan = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.saveTravelPlan(plan);
    return plan;
  } catch (error) {
    console.error('Failed to create travel plan:', error);
    throw error;
  }
}
```

### 상태 관리

현재는 **컴포넌트 로컬 상태**와 **Props Drilling**을 사용하고 있습니다.
향후 **Zustand** 도입이 계획되어 있습니다 (참조: [`DESIGN.md`](./DESIGN.md)).

### 데이터 흐름

```
User Interaction
  ↓
Component (useState)
  ↓
Service Function
  ↓
LocalDatabase (IndexedDB)
  ↓
Data Retrieved
  ↓
Component State Updated
  ↓
UI Re-render
```

---

## 📚 관련 문서

### 프로젝트 문서
- **[README.md](./README.md)**: 기본 프로젝트 설명 및 실행 방법
- **[DESIGN.md](./DESIGN.md)**: 시스템 설계 및 Phase 2 개선 계획
- **[COLORS.md](./COLORS.md)**: Tailwind 커스텀 컬러 가이드

### 외부 문서
- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Vite 가이드](https://vitejs.dev/guide/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Kakao Developers - Places API](https://developers.kakao.com/docs/latest/ko/local/dev-guide)
- [Open-Meteo Weather API](https://open-meteo.com/en/docs)

---

## 🔮 향후 계획 (Phase 2)

현재 프로젝트는 **MVP(Minimum Viable Product)** 상태입니다. 다음 단계에서는:

1. **전역 상태 관리** (Zustand)
2. **인증 & 사용자 관리** (Firebase Auth)
3. **실시간 협업** (Firestore)
4. **오프라인 지원** (PWA + Service Worker)
5. **지도 통합** (Kakao Maps)
6. **테스트 작성** (Jest, Playwright)

자세한 내용은 [`DESIGN.md`](./DESIGN.md) 참조.

---

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

---

## 👥 기여

현재는 개인 프로젝트이지만, 이슈 및 풀 리퀘스트는 언제나 환영합니다!

---

**마지막 업데이트**: 2025년 10월 5일
