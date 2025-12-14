-- Migration: Add organization_id to sessions table
-- Date: 2024-12-13

-- Add organization_id column
ALTER TABLE sessions 
ADD COLUMN organization_id UUID NULL;

-- Populate organization_id from related entities
UPDATE sessions s
SET organization_id = COALESCE(
  (SELECT organization_id FROM agents WHERE id = s.agent_id),
  (SELECT organization_id FROM users WHERE id = s.user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_organization 
ON sessions(organization_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_agent 
ON sessions(user_id, agent_id);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at 
ON sessions(created_at DESC);

-- Index for messages table
CREATE INDEX IF NOT EXISTS idx_messages_session_id 
ON messages(session_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- Composite index for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_session_created 
ON messages(session_id, created_at DESC);
