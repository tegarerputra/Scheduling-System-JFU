-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  google_id TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  description TEXT,
  publish_at TIMESTAMPTZ NOT NULL,
  takedown_at TIMESTAMPTZ NOT NULL,
  duration_days INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('new', 'extended')),
  original_ad_id UUID REFERENCES ads(id) ON DELETE SET NULL,
  publish_event_id TEXT,
  takedown_event_id TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  -- New Auto-Brief Fields
  survey_link TEXT,
  respondent_criteria TEXT,
  incentive_details TEXT,
  incentive_type TEXT CHECK (incentive_type IN ('gopay', 'dana')),
  background_color TEXT
);

-- Create indexes
CREATE INDEX idx_ads_publish_at ON ads(publish_at);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_date ON ads(DATE(publish_at AT TIME ZONE 'Asia/Jakarta'));

-- Auto-update status trigger
CREATE OR REPLACE FUNCTION update_ad_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  
  IF NOW() >= NEW.takedown_at THEN
    NEW.status = 'completed';
  ELSIF NOW() >= NEW.publish_at THEN
    NEW.status = 'live';
  ELSE
    NEW.status = 'scheduled';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ad_status
  BEFORE INSERT OR UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_status();

-- Slot validation function
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_date DATE,
  p_ad_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  new_ads_count INTEGER;
  extended_ads_count INTEGER;
  result JSONB;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE ad_type = 'new'),
    COUNT(*) FILTER (WHERE ad_type = 'extended')
  INTO new_ads_count, extended_ads_count
  FROM ads
  WHERE 
    DATE(publish_at AT TIME ZONE 'Asia/Jakarta') <= p_date
    AND DATE(takedown_at AT TIME ZONE 'Asia/Jakarta') > p_date
    AND status NOT IN ('cancelled', 'completed');
  
  IF p_ad_type = 'new' THEN
    result = jsonb_build_object(
      'available', new_ads_count < 3,
      'new_slots_used', new_ads_count,
      'extended_slots_used', extended_ads_count,
      'message', CASE 
        WHEN new_ads_count >= 3 THEN 'Slot iklan baru penuh untuk tanggal ini (3/3)'
        ELSE format('Slot tersedia (%s/3)', new_ads_count)
      END
    );
  ELSIF p_ad_type = 'extended' THEN
    result = jsonb_build_object(
      'available', (extended_ads_count < 1) OR (new_ads_count < 3),
      'new_slots_used', new_ads_count,
      'extended_slots_used', extended_ads_count,
      'message', CASE 
        WHEN extended_ads_count >= 1 AND new_ads_count >= 3 THEN 'Semua slot penuh untuk tanggal ini'
        WHEN extended_ads_count >= 1 THEN 'Slot extend penuh, menggunakan slot iklan baru'
        ELSE 'Slot extend tersedia'
      END
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
