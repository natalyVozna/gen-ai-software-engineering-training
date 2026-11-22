const express = require('express');
const { createTransaction, findAll, findById } = require('../models/transaction');

const router = express.Router();

const TYPES = ['deposit', 'withdrawal', 'transfer'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

// Minimal validation required by Task 1 (format rules are part of Task 2)
function validate(body) {
  const details = [];
  const { fromAccount, toAccount, amount, currency, type } = body || {};

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    details.push({ field: 'amount', message: 'Amount must be a positive number' });
  }
  if (!isNonEmptyString(currency)) {
    details.push({ field: 'currency', message: 'Currency is required' });
  }
  if (!TYPES.includes(type)) {
    details.push({ field: 'type', message: `Type must be one of: ${TYPES.join(', ')}` });
  } else {
    if ((type === 'withdrawal' || type === 'transfer') && !isNonEmptyString(fromAccount)) {
      details.push({ field: 'fromAccount', message: `fromAccount is required for ${type}` });
    }
    if ((type === 'deposit' || type === 'transfer') && !isNonEmptyString(toAccount)) {
      details.push({ field: 'toAccount', message: `toAccount is required for ${type}` });
    }
  }

  return details;
}

router.post('/', (req, res) => {
  const details = validate(req.body);
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  res.status(201).json(createTransaction(req.body));
});

router.get('/', (req, res) => {
  res.status(200).json(findAll());
});

router.get('/:id', (req, res) => {
  const transaction = findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.status(200).json(transaction);
});

module.exports = router;
