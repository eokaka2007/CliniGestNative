
CREATE TABLE manuals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  version TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manuals_clinic ON manuals(clinic_id);
CREATE INDEX idx_manuals_type ON manuals(type);
