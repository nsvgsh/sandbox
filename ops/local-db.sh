#!/bin/sh

# Convenience wrapper for ops/local-db.mjs
# Usage: ./ops/local-db.sh
#
# What it does (summary):
# - Ensures local Postgres (localhost) if tools are present
# - Drops & recreates DB, applies base schema + migrations
# - Generates and applies admin SQL:
#   • ops/game-admin (level rewards, tasks, thresholds)
#   • ops/integrations-admin (Monetag, Free Trial)
#   • ops/propeller-admin (PropellerAds S2S config)
#   • ops/runtime-config-admin (misc runtime)
# - Writes a combined remote SQL at ops/remote-setup.sql for Supabase
#   one-shot apply (danger: includes full reset in current DB)

set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

exec node "$SCRIPT_DIR/local-db.mjs"


