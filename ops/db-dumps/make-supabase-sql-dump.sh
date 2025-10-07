#!/bin/sh

# Wrapper for make-supabase-sql-dump.mjs
# Usage:
#   ./ops/db-dumps/make-supabase-sql-dump.sh "postgresql://user:pass@host:5432/db"
# or set DATABASE_URL and run without args.

set -e

DBURL="$1"
if [ -n "$DBURL" ]; then
  DATABASE_URL="$DBURL" node ops/db-dumps/make-supabase-sql-dump.mjs
else
  node ops/db-dumps/make-supabase-sql-dump.mjs
fi


