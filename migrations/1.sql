
CREATE TABLE clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  owner_user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinics_owner ON clinics(owner_user_id);
