#!/bin/sh

# Convenience wrapper for ops/local-db.mjs
# Usage: ./ops/local-db.sh

set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

exec node "$SCRIPT_DIR/local-db.mjs"


