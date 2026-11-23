const crypto = require('crypto');

// In-memory storage (no database required)
const transactions = [];

function createTransaction({ fromAccount, toAccount, amount, currency, type }) {
  const transaction = {
    id: crypto.randomUUID(),
    // Unused account is stored as null so every transaction has the same shape
    fromAccount: type === 'deposit' ? null : fromAccount,
    toAccount: type === 'withdrawal' ? null : toAccount,
    amount,
    currency,
    type,
    timestamp: new Date().toISOString(),
    status: 'completed',
  };
  transactions.push(transaction);
  return transaction;
}

function findAll() {
  return transactions;
}

function findById(id) {
  return transactions.find((t) => t.id === id);
}

module.exports = { createTransaction, findAll, findById };
