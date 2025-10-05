# 🗺️ Travel Planner

> 여행 계획을 효율적으로 관리하는 협업형 웹 애플리케이션

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.9-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.18-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 📖 소개

Travel Planner는 개인 또는 그룹의 여행 계획을 체계적으로 관리할 수 있는 웹 애플리케이션입니다. 일정 관리부터 장소 탐색, 예산 관리, 준비물 체크리스트, 여행 후기 작성까지 여행의 전 과정을 하나의 플랫폼에서 관리할 수 있습니다.

## ✨ 주요 기능

### 🗓️ 일정 관리
- **캘린더 뷰**: 월별 일정 한눈에 보기
- **타임라인 뷰**: 날짜별 시간순 일정 표시
- **Drag & Drop**: 일정 순서 손쉽게 재배치
- **시간 설정**: 장소별 시작/종료 시간 및 이동 시간(ETA) 관리

### 🔍 장소 탐색
- **Kakao Places API** 연동 실시간 장소 검색
- 카테고리별 필터링 (숙소, 식당, 관광지, 쇼핑, 엔터테인먼트)
- 장소 상세 정보 (주소, 전화번호, 웹사이트)
- 임시 저장소에 장소 보관 후 일정 추가

### 💰 예산 & 준비물
- **예산 관리**: 카테고리별 지출 항목 추가 및 총액 집계
- **준비물 체크리스트**: 이미지 첨부 가능한 준비물 관리
- **진행률 추적**: 준비물 완료율 시각화

### ⭐ 리뷰 시스템
- **장소별 리뷰**: 방문한 장소에 대한 별점 및 후기 (사진 2장)
- **날짜별 여행 일기**: 하루 전체에 대한 종합 후기 (사진 10장)

### 🔗 공유 기능
- **역할 기반 링크**: Collaborator(편집 가능) / Viewer(읽기 전용)
- **Kakao 공유하기**: 카카오톡으로 여행 계획 공유
- **클립보드 복사**: 링크 즉시 복사

## 🛠 기술 스택

**Frontend**
- React 19.2.0
- TypeScript 4.9.5
- Vite 7.1.9
- Tailwind CSS 3.4.18

**라이브러리**
- @dnd-kit (드래그 앤 드롭)
- react-router-dom (라우팅)
- date-fns (날짜 처리)
- react-datepicker (날짜 선택)

**데이터베이스**
- IndexedDB (로컬 저장소)

**외부 API**
- Kakao Places API
- Open-Meteo Weather API

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18.x 이상
- npm 9.x 이상

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Dohamsu/donghang.git
cd travel-planner

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 로 접속합니다.

### Kakao API 설정

`public/index.html` 파일에서 Kakao JavaScript SDK의 `appkey`를 본인의 키로 변경하세요.

```html
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=services"></script>
```

[Kakao Developers](https://developers.kakao.com/)에서 앱을 생성하고 JavaScript 키를 발급받으세요.

## 📜 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기
npm run lint      # 린트 검사
npm run lint:fix  # 린트 자동 수정
npm run format    # 코드 포맷팅
npm run typecheck # 타입 검사
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   ├── budget/         # 예산 & 준비물
│   ├── explore/        # 장소 탐색
│   ├── schedule/       # 일정 관리
│   ├── review/         # 리뷰 시스템
│   ├── storage/        # 임시 저장소
│   └── share/          # 공유 기능
├── pages/              # 페이지 컴포넌트
├── services/           # 비즈니스 로직 & API
├── types/              # TypeScript 타입 정의
├── contexts/           # React Context
└── hooks/              # Custom Hooks
```

## 📚 문서

- **[PROJECT_INDEX.md](./PROJECT_INDEX.md)**: 전체 프로젝트 문서 및 컴포넌트/API 가이드
- **[DESIGN.md](./DESIGN.md)**: 시스템 설계 및 Phase 2 개선 계획
- **[COLORS.md](./COLORS.md)**: Tailwind 커스텀 컬러 가이드

## 🎯 개발 로드맵

### Phase 1: MVP ✅ (완료)
- [x] 여행 계획 CRUD
- [x] 일정 타임라인 (Drag & Drop)
- [x] Kakao Places API 연동
- [x] 예산 & 준비물 관리
- [x] 리뷰 시스템
- [x] 공유 기능

### Phase 2: 프로덕션 준비 (계획 중)
- [ ] 전역 상태 관리 (Zustand)
- [ ] 인증 시스템 (Firebase Auth)
- [ ] 실시간 협업 (Firestore)
- [ ] 오프라인 지원 (PWA)
- [ ] 지도 통합 (Kakao Maps)
- [ ] 테스트 작성 (Jest, Playwright)

자세한 내용은 [DESIGN.md](./DESIGN.md)를 참고하세요.

## 🖼️ 스크린샷

### 대시보드
여행 계획 목록과 빠른 액세스

### 일정 타임라인
날짜별 일정을 시간순으로 관리

### 장소 탐색
Kakao Places API로 실시간 장소 검색

### 리뷰 시스템
장소별/날짜별 여행 후기 작성

## 🤝 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

---

**개발자**: [@Dohamsu](https://github.com/Dohamsu)
**마지막 업데이트**: 2025년 10월 5일
