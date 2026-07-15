CREATE TABLE default_snapshots (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) UNIQUE NOT NULL,
  snapshot_data JSONB NOT NULL,
  captured_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE activity_log ADD COLUMN reverted BOOLEAN DEFAULT FALSE;