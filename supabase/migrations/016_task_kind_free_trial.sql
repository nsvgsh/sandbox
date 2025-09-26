-- Normalize task_definitions.kind to support 'free-trial'

-- 1) Allow new kind in constraint (and keep 'partner' temporarily for backward compatibility)
DO $$ BEGIN
  BEGIN
    ALTER TABLE task_definitions DROP CONSTRAINT IF EXISTS task_definitions_kind_check;
  EXCEPTION WHEN undefined_object THEN
  END;

  -- Recreate constraint with extended set
  BEGIN
    ALTER TABLE task_definitions
      ADD CONSTRAINT task_definitions_kind_check CHECK (kind IN ('in_app','free-trial','social','partner'));
  EXCEPTION WHEN duplicate_object THEN
  END;
END $$;

-- 2) Backfill legacy rows to new spelling
UPDATE task_definitions SET kind = 'free-trial' WHERE kind = 'partner';


