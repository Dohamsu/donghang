# Travel Planner 컬러 가이드

## 기본 컬러 팔레트

### Primary Colors (주요 색상)
- `trip-primary`: #287dfa - 대표 블루 (로고, 주요 버튼, 링크)
- `trip-primaryDark`: #1967d2 - Hover 상태
- `trip-accent`: #00bcd4 - 강조형 청록색 (보조 CTA)

### Status Colors (상태 색상)
- `trip-success`: #34c759 - 성공 상태, 완료 표시
- `trip-warning`: #ffb300 - 경고, 주의 메시지
- `trip-error`: #ff4b4b - 오류, 삭제 버튼

### Gray Scale (회색 계열)
- `trip-gray-50`: #fafafa - 가장 밝은 회색
- `trip-gray-100`: #f5f5f5
- `trip-gray-200`: #eeeeee
- `trip-gray-300`: #e0e0e0
- `trip-gray-400`: #bdbdbd
- `trip-gray-500`: #9e9e9e
- `trip-gray-600`: #757575
- `trip-gray-700`: #616161
- `trip-gray-800`: #424242
- `trip-gray-900`: #212121 - 가장 어두운 회색

### Text Colors (텍스트 색상)
- `trip-text-primary`: #1a1a1a - 주요 텍스트
- `trip-text-secondary`: #4a4a4a - 보조 텍스트
- `trip-text-link`: #287dfa - 링크 텍스트

### Background Colors (배경 색상)
- `trip-bg-light`: #ffffff - 기본 배경
- `trip-bg-muted`: #f7f9fb - 부드러운 배경
- `trip-bg-card`: #f0f4fa - 카드 배경

## 사용 예시

### 버튼
```tsx
// Primary 버튼
<button className="bg-trip-primary hover:bg-trip-primaryDark text-white">
  확인
</button>

// Secondary 버튼
<button className="bg-trip-gray-200 hover:bg-trip-gray-300 text-trip-text-primary">
  취소
</button>

// Danger 버튼
<button className="bg-trip-error hover:bg-red-700 text-white">
  삭제
</button>
```

### 텍스트
```tsx
// 주요 텍스트
<h1 className="text-trip-text-primary">제목</h1>

// 보조 텍스트
<p className="text-trip-text-secondary">설명</p>

// 링크
<a className="text-trip-text-link hover:underline">링크</a>
```

### 배경
```tsx
// 기본 배경
<div className="bg-trip-bg-light">...</div>

// 부드러운 배경
<div className="bg-trip-bg-muted">...</div>

// 카드 배경
<div className="bg-trip-bg-card">...</div>
```

### 상태 표시
```tsx
// 성공
<div className="bg-green-100 text-trip-success">성공!</div>

// 경고
<div className="bg-yellow-100 text-trip-warning">주의!</div>

// 오류
<div className="bg-red-100 text-trip-error">오류!</div>
```

## 컴포넌트별 색상 가이드

### Button Component
- Primary: `bg-trip-primary`, `hover:bg-trip-primaryDark`
- Secondary: `bg-trip-gray-200`, `hover:bg-trip-gray-300`
- Danger: `bg-trip-error`
- Ghost: `hover:bg-trip-gray-100`

### Modal/Card Components
- Background: `bg-white` or `bg-trip-bg-card`
- Border: `border-trip-gray-200`
- Title: `text-trip-text-primary`
- Description: `text-trip-text-secondary`

### Input Components
- Border: `border-trip-gray-300`
- Focus: `focus:ring-trip-primary`, `focus:border-trip-primary`
- Error: `border-trip-error`
- Placeholder: `text-trip-gray-400`

### Navigation
- Active: `bg-trip-primary`, `text-white`
- Inactive: `text-trip-text-secondary`, `hover:bg-trip-gray-100`

## 일관성 유지 규칙

1. **Primary 액션**은 항상 `trip-primary` 사용
2. **Secondary 액션**은 `trip-gray-200` 배경 사용
3. **위험한 액션** (삭제 등)은 `trip-error` 사용
4. **성공 메시지**는 `trip-success` 사용
5. **텍스트**는 `trip-text-primary` (제목), `trip-text-secondary` (본문) 사용
6. **배경**은 `trip-bg-*` 계열 사용
