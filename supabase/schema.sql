-- Monday.com 보드 데이터 캐시 테이블 (히스토리 보관)
-- Supabase Dashboard > SQL Editor 에서 실행하세요

CREATE TABLE IF NOT EXISTS monday_board_cache (
  id SERIAL PRIMARY KEY,
  board_id TEXT NOT NULL,
  board_name TEXT,
  board_data JSONB NOT NULL,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- board_id + updated_at 복합 UNIQUE 제약 (같은 날짜 중복 방지 + 히스토리 보관)
ALTER TABLE monday_board_cache ADD CONSTRAINT IF NOT EXISTS monday_board_cache_board_date_unique UNIQUE (board_id, updated_at);

-- board_id + updated_at 복합 인덱스 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_monday_board_cache_board_date
ON monday_board_cache(board_id, updated_at DESC);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE monday_board_cache ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (anon key 사용시)
CREATE POLICY "Allow all operations for anon" ON monday_board_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 테이블 구조 설명:
-- id: 자동 증가 기본키
-- board_id: Monday.com 보드 ID (히스토리를 위해 UNIQUE 아님)
-- board_name: 보드 이름
-- board_data: API 응답 전체를 JSONB로 저장
-- updated_at: 데이터 날짜 (DATE 타입으로 오늘 날짜와 비교 용이)
-- created_at: 레코드 생성 시간

-- 캐싱 로직:
-- 1. board_id로 가장 최근 레코드 조회 (ORDER BY updated_at DESC LIMIT 1)
-- 2. updated_at이 오늘이면 -> board_data 사용 (캐시 히트)
-- 3. updated_at이 오늘 이전이면 -> Monday.com API 호출 후 새 레코드 INSERT
-- 4. 데이터가 없으면 -> Monday.com API 호출 후 INSERT
-- * 히스토리가 쌓이므로 과거 데이터 조회 가능
