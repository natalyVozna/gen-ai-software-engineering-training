const express = require('express');
const { findAll } = require('../models/transaction');
const { calculateBalance } = require('../utils/balance');
const { calculateSummary } = require('../utils/summary');
const { validateAccountId } = require('../validators/transactionValidator');

const router = express.Router();

router.get('/:accountId/balance', (req, res) => {
  const { accountId } = req.params;
  const details = validateAccountId(accountId);
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  res.status(200).json({ accountId, balances: calculateBalance(accountId, findAll()) });
});

router.get('/:accountId/summary', (req, res) => {
  const { accountId } = req.params;
  const details = validateAccountId(accountId);
  if (details.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details });
  }
  res.status(200).json({ accountId, ...calculateSummary(accountId, findAll()) });
});

module.exports = router;
