-- Update sessions with organization_id from related users
UPDATE sessions s
SET organization_id = u.organization_id
FROM users u
WHERE s.user_id = u.id::text
  AND s.organization_id IS NULL
  AND u.organization_id IS NOT NULL;

-- For sessions without a user_id, try to get organization_id from the agent
UPDATE sessions s
SET organization_id = a.organization_id
FROM agents a
WHERE s.agent_id = a.id::text
  AND s.organization_id IS NULL
  AND s.user_id IS NULL
  AND a.organization_id IS NOT NULL;

-- Log how many sessions were updated
DO $$
DECLARE
  updated_count INTEGER;
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count 
  FROM sessions 
  WHERE organization_id IS NOT NULL;
  
  SELECT COUNT(*) INTO null_count
  FROM sessions 
  WHERE organization_id IS NULL;
  
  RAISE NOTICE 'Sessions with organization_id: %', updated_count;
  RAISE NOTICE 'Sessions without organization_id: %', null_count;
END $$;
