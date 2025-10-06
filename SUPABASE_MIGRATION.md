# Supabase 마이그레이션 가이드

이 프로젝트를 IndexedDB에서 Supabase로 마이그레이션하여 **실시간 공유 기능**을 활성화했습니다!

## 🎯 완료된 작업

✅ Supabase 클라이언트 설치 및 설정
✅ PostgreSQL 데이터베이스 스키마 생성
✅ database.ts 완전 리팩토링 (IndexedDB → Supabase)
✅ 공유 기능 구현 (멤버 추가/제거/권한 관리)
✅ Row Level Security (RLS) 정책 적용
✅ 환경 변수 설정

---

## 📋 다음 단계 (필수)

### 1️⃣ Supabase에서 SQL 실행

```bash
1. Supabase Dashboard (https://app.supabase.com) 접속
2. 왼쪽 메뉴에서 "SQL Editor" 클릭
3. "New query" 버튼 클릭
4. supabase-setup.sql 파일 열기
5. 전체 내용 복사 → 붙여넣기
6. "Run" 버튼 클릭 (또는 Ctrl+Enter)
```

**예상 결과**: 8개 테이블 + RLS 정책 + 인덱스 생성 완료

---

### 2️⃣ Vercel 환경 변수 설정

로컬에서는 `.env.local`이 자동 생성되었지만, Vercel에 배포하려면 환경 변수를 추가해야 합니다.

```bash
1. Vercel Dashboard (https://vercel.com) 접속
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴
4. 다음 2개 변수 추가:

   VITE_SUPABASE_URL = https://xwswqpzfuuaiwhaqdiod.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

5. "Save" 클릭
6. 프로젝트 재배포 (Deployments → Redeploy)
```

---

### 3️⃣ 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
http://localhost:5173
```

**테스트 항목**:
- [ ] 여행 계획 생성
- [ ] 공유 링크 생성
- [ ] 다른 브라우저/시크릿 모드에서 공유 링크로 접속
- [ ] 멤버 권한 확인

---

## 🔧 주요 변경 사항

### 데이터베이스 구조

**이전**: IndexedDB (브라우저 로컬 저장소)
```typescript
// 각 사용자마다 독립적인 DB
const db = indexedDB.open('TravelPlannerDB')
```

**이후**: Supabase (PostgreSQL, 클라우드 DB)
```typescript
// 모든 사용자가 공유하는 중앙 DB
import { supabase } from './lib/supabase'
```

### 자동 변환 로직

Supabase는 `snake_case`를 사용하지만, 기존 코드는 `camelCase`를 사용합니다.
자동 변환 함수가 추가되어 **기존 코드 수정 없이** 작동합니다.

```typescript
// 자동 변환 예시
{ ownerId: '123' }  →  { owner_id: '123' }  (DB 저장 시)
{ owner_id: '123' } →  { ownerId: '123' }  (DB 조회 시)
```

### 공유 기능

```typescript
import { shareService } from './services/shareService'

// 공유 링크 생성
const link = shareService.generateShareLink(planId, UserRole.VIEWER)

// 멤버 추가
await shareService.addMember(planId, userId, userName, UserRole.COLLABORATOR)

// 접근 권한 확인
const { canAccess, role } = await shareService.canAccessPlan(planId, userId)
```

---

## 🔒 보안 (Row Level Security)

Supabase RLS 정책으로 자동 보안 처리됩니다:

- ✅ **소유자**: 모든 권한 (읽기/쓰기/삭제)
- ✅ **공동 작성자**: 읽기/쓰기
- ✅ **뷰어**: 읽기 전용
- ❌ **비멤버**: 접근 불가

---

## 📊 데이터베이스 스키마

### 주요 테이블

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| `users` | 사용자 정보 | id, name, email, avatar |
| `travel_plans` | 여행 계획 | id, title, owner_id, members |
| `places` | 장소 정보 | id, name, category, latitude, longitude |
| `schedules` | 일정 | id, plan_id, date, place_id, start_time |
| `budget_items` | 예산 | id, plan_id, amount, category |
| `packing_items` | 짐 목록 | id, plan_id, text, completed |
| `reviews` | 후기 | id, plan_id, content, rating |
| `temporary_places` | 임시 장소 | id, plan_id, place |

---

## 🚀 배포

### Vercel 배포

```bash
# 방법 1: Git Push (권장)
git add .
git commit -m "Add Supabase integration"
git push origin main
# → Vercel이 자동으로 배포

# 방법 2: CLI 사용
npm install -g vercel
vercel --prod
```

### 환경 변수 확인

배포 후 반드시 Vercel 대시보드에서 환경 변수가 설정되었는지 확인하세요!

---

## 🐛 트러블슈팅

### 문제: "Missing Supabase environment variables" 에러

**해결**:
```bash
# .env.local 파일 확인
cat .env.local

# 환경 변수가 없으면 다시 생성
echo "VITE_SUPABASE_URL=https://xwswqpzfuuaiwhaqdiod.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env.local

# 개발 서버 재시작
npm run dev
```

### 문제: SQL 실행 시 에러

**해결**:
- Supabase Dashboard → SQL Editor에서 기존 쿼리 삭제 후 재실행
- 또는 테이블을 하나씩 생성

### 문제: RLS 정책으로 데이터 조회 안 됨

**해결**:
```sql
-- Supabase SQL Editor에서 실행
-- 임시로 RLS 비활성화 (테스트용)
ALTER TABLE travel_plans DISABLE ROW LEVEL SECURITY;

-- 다시 활성화
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
```

---

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel 환경 변수 설정](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ 체크리스트

마이그레이션 완료 후 확인:

- [ ] SQL이 Supabase에서 성공적으로 실행됨
- [ ] 로컬 환경에서 앱이 정상 작동
- [ ] Vercel 환경 변수 설정 완료
- [ ] Vercel에 재배포 완료
- [ ] 프로덕션에서 공유 기능 테스트 완료

---

## 🎉 축하합니다!

이제 여행 계획을 **실시간으로 공유**할 수 있습니다! 🌍✈️
