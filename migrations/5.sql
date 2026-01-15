
CREATE TABLE waste_management_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  plan_data TEXT NOT NULL,
  floor_plan_url TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_waste_plans_clinic ON waste_management_plans(clinic_id);
