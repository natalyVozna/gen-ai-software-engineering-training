const TYPES = ['deposit', 'withdrawal', 'transfer'];

// ISO 4217 codes from the runtime's built-in ICU data (no extra packages)
const CURRENCIES = new Set(Intl.supportedValuesOf('currency'));

// "ACC-" prefix + exactly 5 alphanumeric characters
const ACCOUNT_REGEX = /^ACC-[A-Za-z0-9]{5}$/;

const isMissing = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// amount * 100 may be inexact in floating point (1.005 * 100 = 100.49999...),
// so compare with the nearest integer using a small tolerance.
function hasAtMostTwoDecimals(amount) {
  const cents = amount * 100;
  return Math.abs(cents - Math.round(cents)) < 1e-8;
}

function validateAccount(details, field, value) {
  if (isMissing(value)) {
    details.push({ field, message: `${field} is required` });
  } else if (typeof value !== 'string' || !ACCOUNT_REGEX.test(value)) {
    details.push({ field, message: 'Account must match format ACC-XXXXX (5 alphanumeric characters)' });
  }
}

// Returns an array of { field, message }; empty array means valid.
function validateTransaction(body) {
  const details = [];
  const { fromAccount, toAccount, amount, currency, type } = body || {};

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    details.push({ field: 'amount', message: 'Amount must be a positive number' });
  } else if (!hasAtMostTwoDecimals(amount)) {
    details.push({ field: 'amount', message: 'Amount must have at most 2 decimal places' });
  }

  if (isMissing(currency)) {
    details.push({ field: 'currency', message: 'Currency is required' });
  } else if (typeof currency !== 'string' || !CURRENCIES.has(currency)) {
    details.push({ field: 'currency', message: 'Invalid currency code' });
  }

  if (!TYPES.includes(type)) {
    details.push({ field: 'type', message: `Type must be one of: ${TYPES.join(', ')}` });
  } else {
    // Accounts not used by the given type are ignored
    if (type === 'withdrawal' || type === 'transfer') validateAccount(details, 'fromAccount', fromAccount);
    if (type === 'deposit' || type === 'transfer') validateAccount(details, 'toAccount', toAccount);
  }

  return details;
}

module.exports = { validateTransaction };
