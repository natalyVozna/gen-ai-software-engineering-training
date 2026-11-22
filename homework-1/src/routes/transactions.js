const express = require('express');
const { createTransaction, findAll, findById } = require('../models/transaction');
const { validateTransaction } = require('../validators/transactionValidator');

const router = express.Router();

router.post('/', (req, res) => {
  const details = validateTransaction(req.body);
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
