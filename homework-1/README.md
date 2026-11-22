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
  - An account with no transactions returns **`null`** for its balance/value instead of `0`.
  - `amount` is accepted **only as type `number`** (strings such as `"10.5"` are rejected).
- **Verification:** Ran the API against the running server and re-ran the checks after fixing a stale-process issue (see Challenges).

---

## 🧩 Challenges

> Problems encountered and how they were solved. Updated after each task.

| Stage | Problem | Solution |
|-------|---------|----------|
| Setup | The auto-mode permission classifier blocked `npm install express`. | Added allow rules to `.claude/settings.local.json`. |
| Setup | Port 3000 was already taken by another Next.js dev server. | Run and test this project on `PORT=3456`. |
| Task 1 | During verification, an old server process was still running on port 3456 and returned `Cannot POST` for the new routes, so tests looked like they were failing. | Stopped the stale process, restarted the server, and repeated the tests — they passed. |


<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
