
CREATE TABLE routine_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  responsible TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routine_checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  completed_by TEXT NOT NULL,
  completed_at DATETIME NOT NULL,
  notes TEXT,
  photo_url TEXT,
  batch_number TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routine_tasks_clinic ON routine_tasks(clinic_id);
CREATE INDEX idx_routine_checkins_task ON routine_checkins(task_id);
