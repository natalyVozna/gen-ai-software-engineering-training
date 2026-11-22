# 🏦 Homework 1: Banking Transactions API

> **Student Name**: Natalia Nesterchuk
> **Date Submitted**: [Date]
> **AI Tools Used**:
> - **Claude Code** (Sonnet 5.5, Plan mode) — code implementation, curl verification, README updates.
> - **Claude** (Opus 5.5, separate session) — mentor assistant: helped write the prompts for each task, review Claude Code's plans and reports, decide when to commit, and reminded me which screenshots to take.

---

## 📋 Project Overview

A small REST API for banking transactions, built with Node.js and Express 5. It stores data in memory and lets you create transactions (deposit, withdrawal, transfer), list them with filters, fetch one by id, get an account balance per currency, and get an account summary. All input is validated, and errors share one response format.

> Full setup, run and testing instructions: see [HOWTORUN.md](HOWTORUN.md).

---

## ✨ Features

| Method | Path | Description | Status codes |
|--------|------|-------------|--------------|
| `GET` | `/health` | Health check. | `200` |
| `POST` | `/transactions` | Create a transaction (`deposit`, `withdrawal` or `transfer`). | `201`, `400` (validation errors, invalid JSON) |
| `GET` | `/transactions` | List transactions. Optional filters: `accountId`, `type`, `from`, `to` (combined with AND). | `200` (`[]` if nothing matches), `400` (invalid filters) |
| `GET` | `/transactions/:id` | Get one transaction by id. | `200`, `404` |
| `GET` | `/accounts/:accountId/balance` | Balance of an account, calculated separately per currency. | `200`, `400` (invalid `accountId`) |
| `GET` | `/accounts/:accountId/summary` | Total deposits, total withdrawals (per currency), transaction count, most recent transaction date. | `200`, `400` (invalid `accountId`) |

Any other route returns `404 { "error": "Not found" }`; an unexpected error returns `500 { "error": "Internal server error" }`.

**Tasks completed:**

- ✅ **Task 1** — Core API (create, list, get by id, balance)
- ✅ **Task 2** — Transaction validation
- ✅ **Task 3** — Transaction history filters
- ✅ **Task 4, Option A** — Transaction summary endpoint

---

## 🏗️ Architecture

```
src/
├── index.js                          # Starts the server
├── app.js                            # Express app: JSON parsing, routes, 404 and error handlers
├── routes/
│   ├── transactions.js               # /transactions endpoints
│   └── accounts.js                   # /accounts/:accountId/balance and /summary
├── models/
│   └── transaction.js                # In-memory storage: createTransaction, findAll, findById
├── validators/
│   └── transactionValidator.js       # validateTransaction, validateFilters, validateAccountId
└── utils/
    ├── balance.js                    # calculateBalance (pure function)
    ├── filters.js                    # filterTransactions (pure function)
    └── summary.js                    # calculateSummary (pure function)
```

- **Layers:** routes handle HTTP only; validators check input; `utils` hold pure calculation functions that take data and return a result; the model owns the storage.
- **Why in-memory:** the assignment does not require a database, and a plain array keeps the project simple with no extra dependencies or setup. The trade-off is listed in "Known limitations" below.
- **Why Express 5:** it is the current major version of Express (the `package.json` dependency is `^5.3.0`).
- **Validation:** `validateTransaction`, `validateFilters` and `validateAccountId` return a list of errors instead of stopping at the first one, so the client sees all problems in a single response. Rules: `amount` is a positive `number` with at most 2 decimals, accounts match `ACC-XXXXX`, and currency is an uppercase ISO 4217 code.
- **Error format:** every validation error is `400` with the same body:

  ```json
  {
    "error": "Validation failed",
    "details": [{ "field": "amount", "message": "..." }]
  }
  ```

  Other errors use `{ "error": "..." }` (`404`, invalid JSON body `400`, `500`).

---

## 🤝 How I worked with AI

I used two assistants with different roles:

- **Claude Code (Sonnet 5.5)** — the executor: wrote the code, ran the curl checks, and updated this README.
- **Claude (Opus 5.5, separate session)** — the mentor: helped me write the prompt for each task, reviewed Claude Code's plans and reports, helped me decide when to commit, and reminded me which screenshots to take.

**Workflow for every task:**

1. **Plan mode** — Claude Code proposed a plan and asked about ambiguous requirements before writing any code.
2. **My review of the plan** — I read the plan (and discussed it with the mentor session), answered the open questions, and asked for changes.
3. **Implementation** — only after I approved the plan.
4. **curl verification** — the server was started on `PORT=3456`, checked with curl requests (valid and invalid cases, regression of earlier tasks) and stopped by PID.
5. **One commit per task** — each task is a separate commit.

**Decisions I made or approved:**

- Balance and summary totals are calculated **per currency**, with no cross-currency summing.
- `amount` is accepted only as a `number` (strings are rejected).
- Account format `ACC-XXXXX` and the 2-decimal check: the AI proposed the regex and the check, and I approved them.
- `to` in date filters includes the whole day; invalid filter params return `400`.
- Transfers count as deposits/withdrawals in the summary, so it agrees with the balance.
- Chose **Option A** (summary endpoint) for Task 4.
- When to commit, and what is left unchanged in the final cleanup.

### Key prompts

Two real prompts I gave Claude Code (kept in the original Ukrainian).

**Task 1** — scope limits, plan first, wait for approval, verify with curl:

```text
Прочитай homework-1/TASKS.md і реалізуй тільки Task 1 (основні ендпоінти).
Task 2–4 поки не чіпай, README/HOWTORUN не змінюй, commit не роби. Спершу покажи план:
які файли створиш і як рахуватимеш баланс для deposit / withdrawal / transfer.
Дочекайся мого «ок». Після реалізації перевір curl-запитами на PORT=3456 і покажи реальні відповіді.
```

*Meaning:* implement only Task 1; do not touch Tasks 2–4, README/HOWTORUN, and do not commit; show a plan first (files, balance logic for each type) and wait for my "ok"; then verify with curl on `PORT=3456` and show real responses.

**Task 4** — open decisions to settle in the plan (summary of the prompt, not a verbatim copy):

```text
Реалізуй Task 4, Option A (GET /accounts/:accountId/summary). Спершу план, у ньому дай відповідь:
як рахувати суми для різних валют; як враховувати transfer (вхідні/вихідні);
що повертати для рахунку без транзакцій; як валідувати невалідний accountId.
```

*Meaning:* implement the summary endpoint (Option A), and in the plan answer four open questions: totals across currencies, how transfers are counted, what an account with no transactions returns, and how an invalid `accountId` is handled.

The prompts were short because Claude Code reads `TASKS.md` and `CLAUDE.md` itself — I only added scope limits, open decisions, plan-first and verification rules.

---

## 🔧 What AI got wrong / what I corrected

- **Task 2 plan excluded the README.** The plan did not include updating the README, so the AI Workflow Log would have been missing for that task. I asked to include it.
- **Inaccurate statement about `null` in the Task 1 README entry.** It was not precise about where `null` is used. Corrected: `null` is used only for the unused account of a transaction (`deposit` → `fromAccount: null`, `withdrawal` → `toAccount: null`), while an account with no transactions returns `{"balances": {}}`.
- **Wrong expected numbers in the Task 4 plan.** The plan expected total withdrawals of `50` instead of `50.5` (30 + 20.5). The AI noticed this itself while comparing the results with the manual calculation and corrected the expected values.

---

## 🤖 AI Workflow Log

> Updated after each task. For every stage: what was requested, what the AI proposed, decisions made by me, and how it was verified.

### Stage 0 — Setup: Express server + `GET /health`

- **Request:** Set up a minimal Express server with a `GET /health` route.
- **AI proposal:** Project scaffolding with Express and a health-check endpoint. Installing `express` required `npm install`.
- **My decisions:** The auto-mode permission classifier blocked `npm install express`. I added explicit allow rules to `.claude/settings.local.json` so the install and later commands could run.
- **Verification:** Started the server and checked that `GET /health` responds successfully (on `PORT=3456`, see Challenges).

### Task 1 — Core transactions API

- **Request:** Implement the core transactions API (Task 1 from `TASKS.md`).
- **AI proposal:** The AI first suggested an implementation plan and asked clarifying questions about ambiguous requirements.
- **My decisions:**
  - Balance is calculated **separately per currency** (no cross-currency summing).
  - An account with no transactions returns an empty balances object (`{"balances": {}}`). `null` is used only for the unused account of a transaction (`deposit` → `fromAccount: null`, `withdrawal` → `toAccount: null`) so every stored transaction has the same shape.
  - `amount` is accepted **only as type `number`** (strings such as `"10.5"` are rejected).
- **Verification:** Ran the API against the running server and re-ran the checks after fixing a stale-process issue (see Challenges).

### Task 2 — Transaction validation

- **Request:** Implement transaction validation (Task 2 from `TASKS.md`): amount, account format, ISO 4217 currency, meaningful error messages.
- **AI proposal:** The AI explained the three open points (account regex, source of currency codes, float-safe decimals check) in a plan before writing code, and moved the validation into a separate module, `src/validators/transactionValidator.js`.
- **My decisions / key implementation choices:**
  - **Account format:** `/^ACC-[A-Za-z0-9]{5}$/` — uppercase `ACC-` prefix followed by exactly 5 alphanumeric characters (letters of either case). No trimming, so `" ACC-12345"` is rejected. Accounts not used by the transaction type (e.g. `fromAccount` in a `deposit`) are ignored and not validated.
  - **Currency:** valid codes come from the built-in `Intl.supportedValuesOf('currency')` (no new dependency, no hand-maintained list). Codes must be uppercase, so `usd` is rejected.
  - **Max 2 decimal places:** checked with `Math.abs(x * 100 - Math.round(x * 100)) < 1e-8`, because `x * 100` is not exact in floating point.
  - All errors are collected and returned together in `details` (`{ field, message }`).
- **Verification:** Ran curl requests against `PORT=3456`: valid/invalid accounts (4 and 6 characters, lowercase prefix, symbol, missing prefix), currencies (`USD`, `EUR`, `usd`, `ABC`, `XXX`, missing), amounts (`0`, `-1`, `10.123`, `10.12`, `1.005`, `"10"`), a request with several errors at once, and a regression check of Task 1 (balances, `GET /transactions`).

### Task 3 — Transaction history filters

- **Request:** Implement filters on `GET /transactions` (Task 3 from `TASKS.md`): by account, by type, by date range, and combinations.
- **AI proposal:** The AI answered the open questions in a plan before coding: how `accountId` matches, whether `to` includes the whole day, what to return for invalid params, and how filters combine. It split the work into `validateFilters` (in `src/validators/transactionValidator.js`) and a pure `filterTransactions` (in `src/utils/filters.js`).
- **My decisions / key implementation choices:**
  - **`accountId`** matches either `fromAccount` or `toAccount`, and must have the `ACC-XXXXX` format (same rule as Task 2).
  - **Dates** use the strict `YYYY-MM-DD` format and are interpreted in UTC (timestamps are UTC). `from` is the start of the day (inclusive); `to` includes the **whole** day (implemented as `timestamp < start of the next day`), so a transaction at 15:00 on `to=2024-01-31` is returned. Impossible dates such as `2026-02-30` are rejected.
  - **Invalid params** (`type=abc`, `from=not-a-date`, `from` later than `to`, an empty or repeated param) return `400` with the same `{ error, details: [{ field, message }] }` format as Task 2; all errors are reported together. Unknown query params are ignored.
  - **Combination:** all provided filters are combined with **AND**. No match returns `200` with `[]`.
- **Verification:** Ran curl requests against `PORT=3456` (server started and stopped by PID): each filter separately, all filters combined, empty results, and invalid params. The "`to` includes the whole day" rule could not be checked through the API (timestamps are generated by the server at creation time), so it was verified by calling `validateFilters` + `filterTransactions` directly with timestamps `2024-01-31T15:00:00Z` and `2024-01-31T23:59:59.999Z` (both included) and `2024-02-01T00:00:00Z` (excluded).

### Task 4 — Transaction summary endpoint (Option A)

- **Request:** Implement `GET /accounts/:accountId/summary` (Task 4, Option A from `TASKS.md`): total deposits, total withdrawals, number of transactions, most recent transaction date.
- **AI proposal:** The AI answered the open questions in a plan before coding: per-currency totals, how transfers are counted, what to return for an account with no transactions, and how to validate `accountId`. It added a pure `calculateSummary` (`src/utils/summary.js`) and a small `validateAccountId` export in `src/validators/transactionValidator.js`, reusing `filterTransactions` instead of duplicating account matching.
- **My decisions / key implementation choices:**
  - **Totals are per currency** (no cross-currency summing), like balances. `transactionCount` and `lastTransactionDate` are account-wide.
  - **Transfers are included:** an incoming transfer counts as a deposit and an outgoing one as a withdrawal (same rules as `calculateBalance`), so `totalDeposits - totalWithdrawals` equals the balance for every currency.
  - **Account with no transactions** returns `200` with `totals: {}`, `transactionCount: 0`, `lastTransactionDate: null` (consistent with `/balance`; accounts are not stored, so "not found" cannot be told apart from "empty").
  - **Invalid `accountId`** (not `ACC-XXXXX`) returns `400` in the Task 2 format `{ error, details: [{ field, message }] }`, reusing the existing account regex and message.
  - Only `completed` transactions are counted; amounts are rounded to 2 decimals.
- **Verification:** Ran curl requests against `PORT=3456` (server started and stopped by PID) with account `ACC-AAAAA`: deposit USD 100, withdrawal USD 30, incoming transfer USD 50, outgoing transfer USD 20.5 and deposit EUR 10. The result matched the manual calculation: USD deposits 150 / withdrawals 50.5, EUR deposits 10 / withdrawals 0, 5 transactions, last date = the EUR deposit; the balance `{USD: 99.5, EUR: 10}` is consistent with the totals. Also checked the counterparty `ACC-BBBBB` (USD 20.5 in / 50 out, 2 transactions), an account with no transactions (`200`, zeros and `null`) and invalid ids `ACC-1`, `acc-12345`, `ACC-123456` (`400`).

### Cleanup — final pass before submission

- **Request:** Final cleanup of `src/` without changing API behavior, except adding `accountId` validation to `GET /accounts/:accountId/balance`.
- **AI proposal:** The AI reviewed all of `src/` and listed what it would change (and why) before editing: `/balance` validation, one shared constant for the duplicated account-format message, and renaming unused `req` parameters. It also listed what it would deliberately leave alone.
- **My decisions / key implementation choices:**
  - **`/balance` validation:** reuses `validateAccountId` and returns `400` in the Task 2 format, identical to `/summary`. This is the only behavior change.
  - **Duplication:** the message `Account must match format ACC-XXXXX ...` was copied in two places in the validator; it is now one constant, `ACCOUNT_FORMAT_MESSAGE` (the text is unchanged).
  - **Unused parameters:** `req` in `/health`, the 404 handler and the error handler cannot be removed (Express identifies handlers by argument position), so they were renamed to `_req`.
  - **Left as is:** `console.log` (startup message) and `console.error` (500 handler) are not debug output. Error responses were already consistent (`{ error }` or `{ error, details }`). The sign rules shared by `calculateBalance` and `calculateSummary` stay duplicated — extracting them would rewrite working code for little gain. The now-redundant `src/.gitkeep` has since been removed.
- **Verification:** Confirmed port 3456 was free, started the server by PID and ran a regression over all endpoints: `/health`, `POST /transactions` (three valid types, a request with several errors, broken JSON), `GET /transactions` with each filter, a combined filter, an empty result and invalid params, `GET /transactions/:id` (`200` and `404`), `/balance` and `/summary` for valid, empty and invalid accountIds, and an unknown route (`404`). All responses matched the previous behavior; `/balance` now returns `400` for invalid ids. Stopped the server by PID afterwards.

---

## 🧩 Challenges

> Problems encountered and how they were solved. Updated after each task.

| Stage | Problem | Solution |
|-------|---------|----------|
| Setup | The auto-mode permission classifier blocked `npm install express`. | Added allow rules to `.claude/settings.local.json`. |
| Setup | Port 3000 was already taken by another Next.js dev server. | Run and test this project on `PORT=3456`. |
| Task 1 | During verification, an old server process was still running on port 3456 and returned `Cannot POST` for the new routes, so tests looked like they were failing. | Stopped the stale process, restarted the server, and repeated the tests — they passed. |
| Task 2 | A naive decimals check (`amount * 100` is an integer) is unreliable: `1.005 * 100 = 100.49999999999999`, and `0.1 + 0.2` is not exactly `0.3`. | Compare `amount * 100` with its nearest integer using a small tolerance (`1e-8`); verified `10.12` is accepted while `10.123` and `1.005` are rejected. No runtime problems occurred during verification (the server was started and stopped by PID this time, so no stale process remained). |
| Task 3 | Date-range filtering is easy to get subtly wrong: `to=2024-01-31` parsed as midnight would drop transactions made at 15:00 that day, and `new Date("2026-02-30")`-style input can silently roll over to March. | `to` is converted to the start of the next day (exclusive upper bound), and dates are parsed strictly as `YYYY-MM-DD` and rejected if they do not round-trip to the same date. |
| Task 3 | The API sets `timestamp` itself, so the date-range edge cases (15:00 on the last day) cannot be created through curl. | Verified the edge cases by calling the validator and filter functions directly with crafted timestamps; the API-level checks used today's date (`from`/`to` equal to today, tomorrow and yesterday). |
| Task 4 | Ambiguity about what "deposits" and "withdrawals" mean: counting only `type` deposit/withdrawal would ignore transfers and make the summary disagree with the balance. | Incoming transfers count as deposits and outgoing as withdrawals (same rules as `calculateBalance`); checked that `totalDeposits - totalWithdrawals` equals the balance per currency. |
| Task 4 | A stale server from an earlier session was still running on port 3456 with old code, so the first curl run returned `Not found` for the new route (same issue as in Task 1). | Checked the process (`lsof`/`ps`: it was this project's own `node src/index.js`), stopped it by PID, restarted the server and repeated all checks; stopped my own server by PID afterwards. |

---

## ⚠️ Known limitations

- **Data is lost on restart.** Transactions are stored in memory only.
- **Balance can be negative.** There is no check for sufficient funds on withdrawals and outgoing transfers.
- **Timestamp is set by the server** at creation time; the client cannot provide it.
- **Node.js 18+ is required** (e.g. `Intl.supportedValuesOf('currency')` is used for currency validation).

---

## 📸 Screenshots

> TODO: add 3–5 screenshots to `docs/screenshots/` and link them here.

- AI interaction (prompts and responses) — _to be added_
- API running / curl requests — _to be added_
- Test results — _to be added_
- Interesting AI suggestions or corrections — _to be added_

---

## 📖 How to run

See [HOWTORUN.md](HOWTORUN.md) for environment setup, running the server and the testing guide.

---

<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
