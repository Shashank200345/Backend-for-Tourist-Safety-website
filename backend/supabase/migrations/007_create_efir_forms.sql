-- ============================================
-- EFIR Forms Table (IIF-1 alignment)
-- Saves all fields from the FIR form shown in the provided template
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_of_info_enum') THEN
    CREATE TYPE type_of_info_enum AS ENUM ('written','oral');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS efir_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FIR identifiers
  district_id UUID REFERENCES districts(id),
  police_station_id UUID REFERENCES police_stations(id),
  fir_number TEXT,
  year INT,
  fir_date date,

  -- Acts & Sections
  act1 TEXT,
  act1_sections TEXT,
  act2 TEXT,
  act2_sections TEXT,
  act3 TEXT,
  act3_sections TEXT,
  other_acts_sections TEXT,

  -- Occurrence of offence
  occurrence_day TEXT,
  occurrence_date_from date,
  occurrence_date_to date,
  occurrence_time_from time,
  occurrence_time_to time,

  -- Information received at P.S. / GD entry
  info_received_datetime timestamptz,
  gd_entry_no TEXT,

  -- Type of information
  type_of_info type_of_info_enum,

  -- Place of occurrence
  place_distance_direction TEXT,
  place_beat_no TEXT,
  place_address TEXT,
  outside_ps_name TEXT,
  outside_ps_district TEXT,

  -- Complainant / Informant
  complainant_name TEXT,
  complainant_father_spouse TEXT,
  complainant_dob date,
  complainant_nationality TEXT,
  complainant_passport_no TEXT,
  complainant_passport_issue_date date,
  complainant_passport_issue_place TEXT,
  complainant_occupation TEXT,
  complainant_address TEXT,

  -- Accused / Known details
  accused_details TEXT,

  -- Delay / property / inquest / narrative
  delay_reason TEXT,
  stolen_property_details TEXT,
  total_value_stolen numeric(14,2),
  inquest_report_no TEXT,
  first_information_contents TEXT,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_efir_forms_fir_number ON efir_forms(fir_number);
CREATE INDEX IF NOT EXISTS idx_efir_forms_ps_year ON efir_forms(police_station_id, year);
CREATE INDEX IF NOT EXISTS idx_efir_forms_complainant_name ON efir_forms(complainant_name);
CREATE INDEX IF NOT EXISTS idx_efir_forms_fir_date ON efir_forms(fir_date);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_efir_forms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_efir_forms_timestamp ON efir_forms;
CREATE TRIGGER trg_update_efir_forms_timestamp
  BEFORE UPDATE ON efir_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_efir_forms_timestamp();

