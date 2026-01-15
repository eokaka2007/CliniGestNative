
CREATE TABLE health_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT,
  expiry_date DATE,
  partner_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_docs_clinic ON health_documents(clinic_id);
