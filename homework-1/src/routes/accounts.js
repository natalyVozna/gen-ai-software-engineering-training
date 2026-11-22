const express = require('express');
const { findAll } = require('../models/transaction');
const { calculateBalance } = require('../utils/balance');

const router = express.Router();

router.get('/:accountId/balance', (req, res) => {
  const { accountId } = req.params;
  res.status(200).json({ accountId, balances: calculateBalance(accountId, findAll()) });
});

module.exports = router;
