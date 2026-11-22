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

---

## 🧩 Challenges

> Problems encountered and how they were solved. Updated after each task.

| Stage | Problem | Solution |
|-------|---------|----------|
| Setup | The auto-mode permission classifier blocked `npm install express`. | Added allow rules to `.claude/settings.local.json`. |
| Setup | Port 3000 was already taken by another Next.js dev server. | Run and test this project on `PORT=3456`. |
| Task 1 | During verification, an old server process was still running on port 3456 and returned `Cannot POST` for the new routes, so tests looked like they were failing. | Stopped the stale process, restarted the server, and repeated the tests — they passed. |
| Task 2 | A naive decimals check (`amount * 100` is an integer) is unreliable: `1.005 * 100 = 100.49999999999999`, and `0.1 + 0.2` is not exactly `0.3`. | Compare `amount * 100` with its nearest integer using a small tolerance (`1e-8`); verified `10.12` is accepted while `10.123` and `1.005` are rejected. No runtime problems occurred during verification (the server was started and stopped by PID this time, so no stale process remained). |


<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
