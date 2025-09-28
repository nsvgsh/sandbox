DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='partner_postbacks' AND column_name='goal' AND udt_name='int4'
  ) THEN
    ALTER TABLE partner_postbacks
      ALTER COLUMN goal TYPE text USING goal::text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_partner_postbacks_user_provider_goal
  ON partner_postbacks (user_id, provider, goal);
