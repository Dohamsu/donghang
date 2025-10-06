-- ============================================
-- RLS 정책 수정 (테스트용)
-- ============================================
--
-- 문제: Supabase 인증 없이 데이터 조회 시 RLS 정책에서 거부됨
-- 해결: 임시로 모든 사용자에게 읽기 권한 부여
--
-- 주의: 프로덕션 환경에서는 반드시 인증 시스템을 구현해야 합니다!
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can read their travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can create travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can update own travel plans" ON travel_plans;
DROP POLICY IF EXISTS "Users can delete own travel plans" ON travel_plans;

-- 임시 정책: 모든 사용자가 읽기 가능 (테스트용)
CREATE POLICY "Anyone can read travel plans" ON travel_plans
  FOR SELECT USING (true);

-- 임시 정책: 모든 사용자가 생성 가능 (테스트용)
CREATE POLICY "Anyone can create travel plans" ON travel_plans
  FOR INSERT WITH CHECK (true);

-- 임시 정책: 모든 사용자가 수정 가능 (테스트용)
CREATE POLICY "Anyone can update travel plans" ON travel_plans
  FOR UPDATE USING (true);

-- 임시 정책: 모든 사용자가 삭제 가능 (테스트용)
CREATE POLICY "Anyone can delete travel plans" ON travel_plans
  FOR DELETE USING (true);

-- ============================================
-- 다른 테이블도 동일하게 수정
-- ============================================

-- Schedules
DROP POLICY IF EXISTS "Users can read schedules for their plans" ON schedules;
DROP POLICY IF EXISTS "Users can manage schedules for their plans" ON schedules;

CREATE POLICY "Anyone can access schedules" ON schedules
  FOR ALL USING (true);

-- Budget Items
DROP POLICY IF EXISTS "Users can read budget items for their plans" ON budget_items;
DROP POLICY IF EXISTS "Users can manage budget items for their plans" ON budget_items;

CREATE POLICY "Anyone can access budget items" ON budget_items
  FOR ALL USING (true);

-- Packing Items
DROP POLICY IF EXISTS "Users can read packing items for their plans" ON packing_items;
DROP POLICY IF EXISTS "Users can manage packing items for their plans" ON packing_items;

CREATE POLICY "Anyone can access packing items" ON packing_items
  FOR ALL USING (true);

-- Reviews
DROP POLICY IF EXISTS "Users can read reviews for their plans" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for their plans" ON reviews;

CREATE POLICY "Anyone can access reviews" ON reviews
  FOR ALL USING (true);

-- Temporary Places
DROP POLICY IF EXISTS "Users can read temporary places for their plans" ON temporary_places;
DROP POLICY IF EXISTS "Users can manage temporary places for their plans" ON temporary_places;

CREATE POLICY "Anyone can access temporary places" ON temporary_places
  FOR ALL USING (true);

-- ============================================
-- 확인
-- ============================================
-- 이 SQL을 실행한 후 로컬에서 앱을 테스트하세요.
-- 정상 작동하면 성공입니다!
--
-- 나중에 인증 시스템을 구현한 후 원래 정책으로 복구할 수 있습니다.
-- ============================================
