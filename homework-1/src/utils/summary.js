const { filterTransactions } = require('./filters');

const round2 = (n) => Math.round(n * 100) / 100;

// Summary of completed transactions of an account, per currency (same rules as calculateBalance):
// incoming (toAccount, deposit/transfer) counts as a deposit,
// outgoing (fromAccount, withdrawal/transfer) counts as a withdrawal.
// So for each currency: totalDeposits - totalWithdrawals === balance.
// transactionCount and lastTransactionDate are account-wide (not per currency).
function calculateSummary(accountId, transactions) {
  const totals = {};
  const bucket = (currency) => {
    if (!totals[currency]) totals[currency] = { totalDeposits: 0, totalWithdrawals: 0 };
    return totals[currency];
  };

  const own = filterTransactions(transactions, { accountId }).filter((t) => t.status === 'completed');
  let lastMs = null;

  for (const t of own) {
    if (t.toAccount === accountId && (t.type === 'deposit' || t.type === 'transfer')) {
      bucket(t.currency).totalDeposits += t.amount;
    }
    if (t.fromAccount === accountId && (t.type === 'withdrawal' || t.type === 'transfer')) {
      bucket(t.currency).totalWithdrawals += t.amount;
    }
    const time = Date.parse(t.timestamp);
    if (lastMs === null || time > lastMs) lastMs = time;
  }

  for (const entry of Object.values(totals)) {
    entry.totalDeposits = round2(entry.totalDeposits);
    entry.totalWithdrawals = round2(entry.totalWithdrawals);
  }

  return {
    totals,
    transactionCount: own.length,
    lastTransactionDate: lastMs === null ? null : new Date(lastMs).toISOString(),
  };
}

module.exports = { calculateSummary };
