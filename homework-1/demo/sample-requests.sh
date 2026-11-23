#!/usr/bin/env bash
# Demo requests for every endpoint: success scenarios and errors (400, 404).
# The server must already be running. Usage:
#   ./demo/sample-requests.sh
#   BASE_URL=http://localhost:3456 ./demo/sample-requests.sh
set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
DIR="$(cd "$(dirname "$0")" && pwd)"

# call "<title>" <curl args...>  - prints the title, the body and the HTTP status
call() {
  local title="$1"; shift
  echo
  echo "### $title"
  curl -s -w '\nHTTP %{http_code}\n' "$@"
}

if ! curl -s -o /dev/null "$BASE_URL/health"; then
  echo "Server is not reachable at $BASE_URL. Start it first (./demo/run.sh)." >&2
  exit 1
fi

# --- 0. Load sample-data.json (the server does not load data by itself) ---
echo "### Loading demo/sample-data.json via POST $BASE_URL/transactions"
SEED_OUT="$(BASE_URL="$BASE_URL" node -e '
const data = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
(async () => {
  for (const tx of data) {
    const res = await fetch(process.env.BASE_URL + "/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    });
    const body = await res.json();
    console.log(res.status + " " + tx.type + " " + tx.amount + " " + tx.currency + " " + (body.id || ""));
  }
})();
' "$DIR/sample-data.json")"
echo "$SEED_OUT"
TX_ID="$(echo "$SEED_OUT" | head -n 1 | awk '{print $5}')"

# --- 1. Success scenarios ---
call "GET /health (200)" "$BASE_URL/health"

call "POST /transactions - new deposit (201)" -X POST "$BASE_URL/transactions" \
  -H 'Content-Type: application/json' \
  -d '{"type":"deposit","toAccount":"ACC-C3003","amount":75.5,"currency":"GBP"}'

call "GET /transactions - all (200)" "$BASE_URL/transactions"
call "GET /transactions?accountId=ACC-A1001 (200)" "$BASE_URL/transactions?accountId=ACC-A1001"
call "GET /transactions?type=transfer (200)" "$BASE_URL/transactions?type=transfer"
call "GET /transactions?from=2000-01-01&to=2100-01-01 (200)" "$BASE_URL/transactions?from=2000-01-01&to=2100-01-01"
call "GET /transactions - combined filter (200)" "$BASE_URL/transactions?accountId=ACC-A1001&type=deposit"
call "GET /transactions - no matches, empty list (200)" "$BASE_URL/transactions?from=2000-01-01&to=2000-01-02"
call "GET /transactions/:id (200)" "$BASE_URL/transactions/$TX_ID"
call "GET /accounts/ACC-A1001/balance (200)" "$BASE_URL/accounts/ACC-A1001/balance"
call "GET /accounts/ACC-A1001/summary (200)" "$BASE_URL/accounts/ACC-A1001/summary"
call "GET /accounts/ACC-Z9999/balance - unused account (200)" "$BASE_URL/accounts/ACC-Z9999/balance"

# --- 2. Errors ---
call "POST /transactions - several validation errors (400)" -X POST "$BASE_URL/transactions" \
  -H 'Content-Type: application/json' \
  -d '{"type":"transfer","fromAccount":"BAD","amount":-5.123,"currency":"XXX1"}'
call "POST /transactions - broken JSON (400)" -X POST "$BASE_URL/transactions" \
  -H 'Content-Type: application/json' -d '{"type":'
call "GET /transactions?type=refund - invalid filter (400)" "$BASE_URL/transactions?type=refund"
call "GET /transactions?from=2025-02-30 - invalid date (400)" "$BASE_URL/transactions?from=2025-02-30"
call "GET /accounts/BAD/balance - invalid accountId (400)" "$BASE_URL/accounts/BAD/balance"
call "GET /accounts/BAD/summary - invalid accountId (400)" "$BASE_URL/accounts/BAD/summary"
call "GET /transactions/does-not-exist (404)" "$BASE_URL/transactions/does-not-exist"
call "GET /unknown - unknown route (404)" "$BASE_URL/unknown"

echo
echo "Done."
