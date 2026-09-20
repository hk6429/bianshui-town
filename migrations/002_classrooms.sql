CREATE TABLE IF NOT EXISTS learning_classes (
 id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL,
 code TEXT NOT NULL UNIQUE, open INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS learning_classes_owner ON learning_classes(owner);
CREATE TABLE IF NOT EXISTS learning_members (
 class_id TEXT NOT NULL REFERENCES learning_classes(id), student TEXT NOT NULL,
 alias TEXT NOT NULL, joined_at INTEGER NOT NULL, PRIMARY KEY(class_id, student)
);
CREATE INDEX IF NOT EXISTS learning_members_student ON learning_members(student);
CREATE TABLE IF NOT EXISTS learning_assignments (
 id TEXT PRIMARY KEY, class_id TEXT NOT NULL REFERENCES learning_classes(id),
 quest TEXT NOT NULL, support TEXT NOT NULL, title TEXT NOT NULL,
 open INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS learning_assignments_class ON learning_assignments(class_id);
CREATE TABLE IF NOT EXISTS learning_submissions (
 assignment_id TEXT NOT NULL REFERENCES learning_assignments(id), student TEXT NOT NULL,
 version INTEGER NOT NULL, payload TEXT NOT NULL CHECK(length(CAST(payload AS BLOB))<=750000),
 submitted_at INTEGER NOT NULL, feedback TEXT, PRIMARY KEY(assignment_id, student, version)
);
