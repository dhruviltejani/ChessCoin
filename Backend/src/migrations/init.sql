-- Create ENUM type for signature chess pieces if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chess_piece') THEN
        CREATE TYPE chess_piece AS ENUM ('rook', 'pawn', 'bishop', 'queen', 'king', 'knight');
    END IF;
END$$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(20) NOT NULL,
    handle VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_piece chess_piece NOT NULL DEFAULT 'queen',
    google_id VARCHAR(255),
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_display_name_length CHECK (char_length(trim(display_name)) >= 2),
    CONSTRAINT chk_handle_format CHECK (
        char_length(trim(handle)) >= 3 AND 
        handle ~ '^[a-zA-Z0-9_]+$'
    )
);

-- Migrations for existing tables
DO $$
BEGIN
    -- Allow nullable password_hash for OAuth users
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth_provider') THEN
        ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'local';
    END IF;
END$$;

-- Case-insensitive unique indexes for handle, email, and google_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle_lower ON users (LOWER(handle));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
