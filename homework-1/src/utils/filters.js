// Applies already-validated filters (see validateFilters) to a list of transactions.
// All provided filters are combined with AND.
// fromMs is inclusive; toExclusiveMs is the start of the day after `to`,
// so the whole `to` day is included.
function filterTransactions(transactions, { accountId, type, fromMs, toExclusiveMs } = {}) {
  return transactions.filter((t) => {
    if (accountId !== undefined && t.fromAccount !== accountId && t.toAccount !== accountId) {
      return false;
    }
    if (type !== undefined && t.type !== type) return false;

    const time = Date.parse(t.timestamp);
    if (fromMs !== undefined && time < fromMs) return false;
    if (toExclusiveMs !== undefined && time >= toExclusiveMs) return false;
    return true;
  });
}

module.exports = { filterTransactions };
