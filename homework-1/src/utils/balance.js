// Balance per currency, based on completed transactions only.
// deposit: +amount to toAccount; withdrawal: -amount from fromAccount;
// transfer: -amount from fromAccount and +amount to toAccount.
function calculateBalance(accountId, transactions) {
  const balances = {};

  const add = (currency, value) => {
    balances[currency] = (balances[currency] || 0) + value;
  };

  for (const t of transactions) {
    if (t.status !== 'completed') continue;
    if (t.toAccount === accountId && (t.type === 'deposit' || t.type === 'transfer')) {
      add(t.currency, t.amount);
    }
    if (t.fromAccount === accountId && (t.type === 'withdrawal' || t.type === 'transfer')) {
      add(t.currency, -t.amount);
    }
  }

  // Round to 2 decimals to avoid floating point artifacts
  for (const currency of Object.keys(balances)) {
    balances[currency] = Math.round(balances[currency] * 100) / 100;
  }

  return balances;
}

module.exports = { calculateBalance };
