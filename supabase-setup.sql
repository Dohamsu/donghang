-- ============================================
-- Travel Planner Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAVEL PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  region TEXT NOT NULL,
  weather_summary JSONB,
  confirmed BOOLEAN DEFAULT FALSE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_travel_plans_owner_id ON travel_plans(owner_id);
CREATE INDEX idx_travel_plans_created_at ON travel_plans(created_at DESC);

-- ============================================
-- PLACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_location ON places(latitude, longitude);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  eta INTEGER,
  "order" INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_plan_id ON schedules(plan_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_plan_date ON schedules(plan_id, date);

-- ============================================
-- BUDGET ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  day DATE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_items_plan_id ON budget_items(plan_id);
CREATE INDEX idx_budget_items_category ON budget_items(category);

-- ============================================
-- PACKING ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS packing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packing_items_plan_id ON packing_items(plan_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  written_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_plan_id ON reviews(plan_id);
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_author_id ON reviews(author_id);

-- ============================================
-- TEMPORARY PLACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS temporary_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  place JSONB NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_recommended BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_temporary_places_plan_id ON temporary_places(plan_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_places ENABLE ROW LEVEL SECURITY;

-- Users: Can read all, but only update own profile
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid()::uuid);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (id = auth.uid()::uuid);

-- Travel Plans: Can read plans where they are owner or member
CREATE POLICY "Users can read their travel plans" ON travel_plans FOR SELECT
  USING (
    owner_id = auth.uid()::uuid
    OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
  );
CREATE POLICY "Users can create travel plans" ON travel_plans FOR INSERT
  WITH CHECK (owner_id = auth.uid()::uuid);
CREATE POLICY "Users can update own travel plans" ON travel_plans FOR UPDATE
  USING (owner_id = auth.uid()::uuid);
CREATE POLICY "Users can delete own travel plans" ON travel_plans FOR DELETE
  USING (owner_id = auth.uid()::uuid);

-- Places: Public read, authenticated write
CREATE POLICY "Anyone can read places" ON places FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create places" ON places FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Schedules: Access through travel plan membership
CREATE POLICY "Users can read schedules for their plans" ON schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = schedules.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );
CREATE POLICY "Users can manage schedules for their plans" ON schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = schedules.plan_id
      AND owner_id = auth.uid()::uuid
    )
  );

-- Budget Items: Access through travel plan membership
CREATE POLICY "Users can read budget items for their plans" ON budget_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = budget_items.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );
CREATE POLICY "Users can manage budget items for their plans" ON budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = budget_items.plan_id
      AND owner_id = auth.uid()::uuid
    )
  );

-- Packing Items: Access through travel plan membership
CREATE POLICY "Users can read packing items for their plans" ON packing_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = packing_items.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );
CREATE POLICY "Users can manage packing items for their plans" ON packing_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = packing_items.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );

-- Reviews: Access through travel plan membership
CREATE POLICY "Users can read reviews for their plans" ON reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = reviews.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );
CREATE POLICY "Users can create reviews for their plans" ON reviews FOR INSERT
  WITH CHECK (
    author_id = auth.uid()::uuid
    AND EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = reviews.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );

-- Temporary Places: Access through travel plan membership
CREATE POLICY "Users can read temporary places for their plans" ON temporary_places FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = temporary_places.plan_id
      AND (owner_id = auth.uid()::uuid
           OR members::jsonb @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
    )
  );
CREATE POLICY "Users can manage temporary places for their plans" ON temporary_places FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE id = temporary_places.plan_id
      AND owner_id = auth.uid()::uuid
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON travel_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packing_items_updated_at BEFORE UPDATE ON packing_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a test user (you can remove this later)
-- INSERT INTO users (id, name, email)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Test User', 'test@example.com');
