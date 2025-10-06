-- ============================================
-- 외래 키 제약 조건 수정 (테스트용)
-- ============================================
--
-- 문제: owner_id가 users 테이블에 없어서 여행 계획 생성 실패
-- 해결: 외래 키 제약 조건을 임시로 제거
--
-- ============================================

-- travel_plans 테이블의 외래 키 제거
ALTER TABLE travel_plans DROP CONSTRAINT IF EXISTS travel_plans_owner_id_fkey;

-- schedules 테이블의 외래 키 제거 (선택사항)
ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_place_id_fkey;

-- budget_items 테이블의 외래 키 제거 (선택사항)
ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_place_id_fkey;

-- reviews 테이블의 외래 키 제거
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_author_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_fkey;

-- ============================================
-- 확인
-- ============================================
-- 이 SQL을 실행하면 외래 키 검사 없이 데이터를 삽입할 수 있습니다.
-- 테스트가 끝나면 나중에 다시 외래 키를 추가할 수 있습니다.
-- ============================================
