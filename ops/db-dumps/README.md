# DB Dumps — Supabase SQL Editor Ready

Generates a SQL dump of a Postgres database that runs cleanly in the Supabase SQL Editor:
- Sanitized (no `\restrict`/`\unrestrict`, no psql meta-commands)
- INSERT-based (no COPY / `\.`)
- Includes a cleanup prologue that drops only the objects recreated by the dump (functions, tables, sequences in `public`), schema-qualified to avoid `search_path` issues

## Requirements
- Node.js 18+
- Postgres client tools in PATH (preferably `pg_dump` from libpq). The script auto-detects common Homebrew/Postgres.app locations.

## Usage
```bash
# Default (reads web/.env.local → DATABASE_URL)
node ops/db-dumps/make-supabase-sql-dump.mjs

# Override DB explicitly
node ops/db-dumps/make-supabase-sql-dump.mjs --db "postgresql://user:pass@host:5432/dbname" \
  --out ops/db-dumps/dumps/dbname_$(date +%Y%m%d_%H%M%S).supabase.sql

# Or via env
DATABASE_URL="postgresql://user:pass@host:5432/dbname" node ops/db-dumps/make-supabase-sql-dump.mjs

# Shell wrapper (also defaults to web/.env.local if not passed an URL)
./ops/db-dumps/make-supabase-sql-dump.sh
```

The output file can be pasted into Supabase SQL Editor or applied via CLI:
```bash
supabase db query --file ops/db-dumps/dumps/your_dump.supabase.sql
# or
psql "postgresql://...sslmode=require" -f ops/db-dumps/dumps/your_dump.supabase.sql
```

## Notes
- The cleanup prologue is generated from the dump itself (parsed object list) and only drops objects that will be recreated by the script, minimizing risk in shared databases.
- Functions are dropped with full signatures; tables and sequences are schema-qualified and dropped CASCADE.
- Extension `pgcrypto` is not dropped; dump preserves `CREATE EXTENSION IF NOT EXISTS pgcrypto` if present.


