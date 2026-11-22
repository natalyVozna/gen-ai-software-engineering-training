# 🏦 Homework 1: Banking Transactions API

> **Student Name**: [Your Name]
> **Date Submitted**: [Date]
> **AI Tools Used**: [List tools, e.g., Claude Code, GitHub Copilot]

---

## 📋 Project Overview

[Briefly describe your implementation - what you built and the key features]

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


<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
