-- Remove legacy keys and functions no longer used

-- 1) Drop legacy config key claim_ttl_seconds
delete from game_config where key = 'claim_ttl_seconds';

-- 2) Drop legacy/obsolete functions if exist (older bonus claim variants)
DO $$ BEGIN
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_level_bonus(uuid,int,numeric)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_level_bonus_v3(uuid,int,numeric,uuid,uuid)'; EXCEPTION WHEN undefined_function THEN END;
END $$;

-- 3) Keep claim_level_bonus_v4 as the only supported path

-- 4) Remove schedule→tasks sync helper (sync_level_offer_schedule_to_tasks), sync is disabled by design
DO $$ BEGIN
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS sync_level_offer_schedule_to_tasks()'; EXCEPTION WHEN undefined_function THEN END;
END $$;


