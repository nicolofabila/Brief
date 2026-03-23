#!/usr/bin/env bash
# Free port 3000 so `next dev` does not silently move to 3001 (easy to open the wrong tab and think the app is stuck).
set -e
pids=$(lsof -tiTCP:3000 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "${pids}" ]; then
  echo "Port 3000 is in use (PID(s): ${pids}). Stopping so this dev server can bind to 3000."
  kill -9 ${pids} 2>/dev/null || true
  sleep 0.3
fi
exec next dev -p 3000
