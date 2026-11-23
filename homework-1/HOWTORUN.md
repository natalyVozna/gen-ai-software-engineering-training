# ▶️ How to Run the application

## Environment Setup

### 1. Node.js

**Node.js 18 or newer** is required. The currency validation uses `Intl.supportedValuesOf('currency')`, which is not available in older Node versions.

Check your version:

```bash
node -v
```

The output should be `v18.x.x` or higher. This project was tested on **Node.js v24.22.2**.

### 2. Install dependencies

From the `homework-1/` directory:

```bash
cd homework-1
npm install
```

### 3. Start the server

```bash
npm start
```

The server listens on port **3000** by default: `http://localhost:3000`.

If port 3000 is already in use, set a different port with the `PORT` environment variable:

```bash
PORT=3456 npm start
```

### 4. Environment variables

No new environment variables are introduced, and no `.env` file is needed. The only optional variable is `PORT` (default `3000`).

## Running the app

Run all commands from the `homework-1/` directory.

| Way | Command | Notes |
| --- | --- | --- |
| npm | `npm start` | Port `3000` by default |
| Custom port | `PORT=3456 npm start` | Use when `3000` is busy |
| Demo script | `./demo/run.sh` | Checks Node 18+, runs `npm install` if `node_modules` is missing, checks that the port is free, then starts the server. Also accepts `PORT`, e.g. `PORT=3456 ./demo/run.sh` |

When the server is up you will see:

```
Banking API listening on http://localhost:3000
```

Quick check: `curl http://localhost:3000/health` should return `{"status":"ok"}`.

To stop the server, press **Ctrl+C** in the terminal where it runs.

> The data is stored in memory only. Every restart starts with an empty list of transactions.

## Testing guide

Before you start, make sure the port is free (see [Troubleshooting](#troubleshooting)) and the server is running in a **separate terminal**.

### Option 1: `demo/sample-requests.sh` (curl)

```bash
./demo/sample-requests.sh
```

If the server runs on another port:

```bash
BASE_URL=http://localhost:3456 ./demo/sample-requests.sh
```

The script:

1. Loads every transaction from `demo/sample-data.json` with `POST /transactions` (the server does not load any data by itself, and it sets `id` and `timestamp`).
2. Calls every endpoint, so filters, balance and summary return meaningful data.
3. Calls the error scenarios.

Each request prints a title, the response body and `HTTP <status>`. Run the script **once per server start**: it creates the demo transactions again each time, so a second run doubles the balances.

Expected responses (summary):

| Request | Status | What you should see |
| --- | --- | --- |
| Loading `sample-data.json` | `201` ×6 | One line per transaction with a generated `id` |
| `GET /health` | `200` | `{"status":"ok"}` |
| `POST /transactions` (valid) | `201` | The created transaction with `id`, `timestamp`, `status: "completed"` |
| `GET /transactions` (with or without filters) | `200` | An array of transactions; `[]` if nothing matches |
| `GET /transactions/:id` (existing) | `200` | One transaction |
| `GET /accounts/ACC-A1001/balance` | `200` | `{"accountId":"ACC-A1001","balances":{"USD":649.75,"EUR":300}}` |
| `GET /accounts/ACC-A1001/summary` | `200` | Per-currency `totalDeposits` / `totalWithdrawals`, `transactionCount: 4`, `lastTransactionDate` |
| `GET /accounts/ACC-Z9999/balance` (unused account) | `200` | `{"accountId":"ACC-Z9999","balances":{}}` |
| `POST /transactions` (invalid body) | `400` | `{"error":"Validation failed","details":[{"field":...,"message":...}]}` |
| `POST /transactions` (broken JSON) | `400` | `{"error":"Invalid JSON body"}` |
| Invalid filter (`type=refund`, `from=2025-02-30`) | `400` | `Validation failed` with `details` |
| `GET /accounts/BAD/balance` or `/summary` | `400` | `Validation failed` (account must match `ACC-XXXXX`) |
| `GET /transactions/does-not-exist` | `404` | `{"error":"Transaction not found"}` |
| Unknown route (`GET /unknown`) | `404` | `{"error":"Not found"}` |

The balance and summary numbers above are for a fresh server and one run of the script (`ACC-A1001`: USD `+1000 −200.25 −150`, EUR `+300`).

### Option 2: `demo/sample-requests.http` (VS Code REST Client)

1. Install the **REST Client** extension (`humao.rest-client`) in VS Code.
2. Start the server.
3. Open `demo/sample-requests.http`. If the server is not on port `3000`, change `@baseUrl` at the top of the file.
4. Click **Send Request** above a request. The response opens in a side panel.

Send the six "Seed data" requests first (they mirror `demo/sample-data.json`), then the others. The expected status codes are written in the request titles and match the table above.

### Stopping the server

Press **Ctrl+C** in the server terminal. The port is released immediately. Restarting the server clears all transactions.

## Troubleshooting

### Port is already in use

If the port is busy, the server prints a clear message and exits with code `1`:

```
Port 3000 is already in use. Try PORT=3456 npm start
```

`./demo/run.sh` checks the port first and fails with a similar message.

Find the process that uses the port:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Then either stop that process or use another port:

```bash
PORT=3456 npm start
```

(and `BASE_URL=http://localhost:3456 ./demo/sample-requests.sh` for the demo).

### An old server is still running on the port

You started the server earlier and closed the terminal without Ctrl+C. Find its PID and check the command is `node src/index.js` and that the working directory is `homework-1`:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN     # note the PID
ps -p <PID> -o pid,command
kill <PID>
```

Do not stop a process you do not recognise. Use another `PORT` instead. Old servers also keep their old in-memory data, which makes balances look wrong.

### Node version is too old

Symptoms: `./demo/run.sh` prints `Node 18 or newer is required`, or the server fails with `Intl.supportedValuesOf is not a function`.

```bash
node -v        # must be v18.x.x or higher
```

Install Node 18+ (for example with `nvm install 18` or from nodejs.org) and run `npm install` again. `package.json` declares `"engines": { "node": ">=18" }`.

### `./demo/run.sh: Permission denied`

```bash
chmod +x demo/run.sh demo/sample-requests.sh
```
