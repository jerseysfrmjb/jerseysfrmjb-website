ALTER TABLE pinterest_connections
  ADD COLUMN environment TEXT NOT NULL DEFAULT 'production';
