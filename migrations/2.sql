
CREATE TABLE equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  calibration_date DATE,
  calibration_due_date DATE,
  responsible_technician TEXT,
  notes TEXT,
  manual_url TEXT,
  invoice_url TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_equipment_clinic ON equipment(clinic_id);
CREATE INDEX idx_equipment_active ON equipment(is_active);
