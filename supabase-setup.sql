-- ═══════════════════════════════════════════════════
-- Tisha & Harsh Wedding — Supabase Database Setup V3
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════

-- RSVP Responses Table
CREATE TABLE IF NOT EXISTS rsvps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  relation TEXT,
  attending TEXT NOT NULL DEFAULT 'yes',
  guests TEXT DEFAULT '1',
  tier TEXT,
  checkin TEXT,
  checkout TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishes / Guestbook Table
CREATE TABLE IF NOT EXISTS wishes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  relation TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert RSVPs" ON rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert wishes" ON wishes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read RSVPs" ON rsvps FOR SELECT USING (true);
CREATE POLICY "Anyone can read wishes" ON wishes FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rsvps_created ON rsvps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at DESC);
