#!/usr/bin/env bash
# Starts the Banking API. Usage: ./demo/run.sh   (or PORT=3456 ./demo/run.sh)
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Node 18 or newer is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node 18 or newer is required (found $(node -v))." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "node_modules not found - running npm install..."
  npm install
fi

export PORT="${PORT:-3000}"

# Fail early with a clear message if the port is busy (the app also exits with code 1).
if ! node -e 'const s=require("net").createServer();s.once("error",()=>process.exit(1));s.listen(Number(process.env.PORT),()=>s.close())'; then
  echo "Error: port $PORT is already in use. Stop the other process or use another port, e.g. PORT=3456 ./demo/run.sh" >&2
  exit 1
fi

echo "Starting server on port $PORT (Ctrl+C to stop)..."
exec npm start
