
CREATE TABLE partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  city TEXT,
  state TEXT,
  discount_code TEXT,
  commission_rate REAL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_category ON partners(category);
