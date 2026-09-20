CREATE TABLE IF NOT EXISTS town_saves (
  user_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  payload TEXT NOT NULL CHECK (length(CAST(payload AS BLOB)) <= 2000000),
  updated_at TEXT NOT NULL
);
