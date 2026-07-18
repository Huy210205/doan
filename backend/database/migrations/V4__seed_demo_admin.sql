-- Ensure bcrypt hashing support for the seeded demo admin password
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Repair users table so it matches the current app expectations even if V3 was not applied
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS logo TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

UPDATE users
SET role = 'user'
WHERE role IS NULL;

UPDATE users
SET is_blocked = FALSE
WHERE is_blocked IS NULL;

ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN is_blocked SET DEFAULT FALSE;

-- Seed demo admin account
INSERT INTO users (email, username, hashed_password, role, is_verified, is_blocked, created_at)
VALUES (
    'admin@test.com',
    'Demo Admin',
    crypt('admin123', gen_salt('bf')),
    'admin',
    TRUE,
    FALSE,
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET username = EXCLUDED.username,
    hashed_password = EXCLUDED.hashed_password,
    role = 'admin',
    is_verified = TRUE,
    is_blocked = FALSE;