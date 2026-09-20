CREATE TABLE IF NOT EXISTS learning_teams (
 id TEXT PRIMARY KEY, assignment_id TEXT NOT NULL REFERENCES learning_assignments(id),
 name TEXT NOT NULL, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS learning_teams_assignment ON learning_teams(assignment_id);
CREATE TABLE IF NOT EXISTS learning_team_members (
 team_id TEXT NOT NULL REFERENCES learning_teams(id), assignment_id TEXT NOT NULL,
 student TEXT NOT NULL, role INTEGER NOT NULL CHECK(role BETWEEN 0 AND 3),
 evidence INTEGER, reason TEXT NOT NULL DEFAULT '', reply_to TEXT, reply TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(team_id,student), UNIQUE(assignment_id,student)
);
CREATE TABLE IF NOT EXISTS learning_team_versions (
 team_id TEXT NOT NULL REFERENCES learning_teams(id), version INTEGER NOT NULL,
 author TEXT NOT NULL, conclusion TEXT NOT NULL, snapshot TEXT NOT NULL,
 created_at INTEGER NOT NULL, PRIMARY KEY(team_id,version)
);
