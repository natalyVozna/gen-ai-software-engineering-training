const TYPES = ['deposit', 'withdrawal', 'transfer'];

// ISO 4217 codes from the runtime's built-in ICU data (no extra packages)
const CURRENCIES = new Set(Intl.supportedValuesOf('currency'));

// "ACC-" prefix + exactly 5 alphanumeric characters
const ACCOUNT_REGEX = /^ACC-[A-Za-z0-9]{5}$/;

const ACCOUNT_FORMAT_MESSAGE = 'Account must match format ACC-XXXXX (5 alphanumeric characters)';

const isMissing =(v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

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
    details.push({ field, message: ACCOUNT_FORMAT_MESSAGE });
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

const DAY_MS = 24 * 60 * 60 * 1000;

// Parses a strict YYYY-MM-DD date as UTC midnight; returns ms or null if invalid.
function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.getTime();
}

// Validates GET /transactions query params. Returns { details, filters }.
// Unknown params are ignored; empty or repeated params are rejected.
function validateFilters(query) {
  const details = [];
  const filters = {};
  const { accountId, type, from, to } = query || {};

  const isSingle = (field, value) => {
    if (typeof value === 'string' && value !== '') return true;
    details.push({ field, message: `${field} must be a single non-empty value` });
    return false;
  };

  if (accountId !== undefined && isSingle('accountId', accountId)) {
    if (ACCOUNT_REGEX.test(accountId)) filters.accountId = accountId;
    else details.push({ field: 'accountId', message: ACCOUNT_FORMAT_MESSAGE });
  }

  if (type !== undefined && isSingle('type', type)) {
    if (TYPES.includes(type)) filters.type = type;
    else details.push({ field: 'type', message: `Type must be one of: ${TYPES.join(', ')}` });
  }

  let fromMs;
  let toMs;
  if (from !== undefined && isSingle('from', from)) {
    fromMs = parseDate(from);
    if (fromMs === null) details.push({ field: 'from', message: 'from must be a valid date in format YYYY-MM-DD' });
  }
  if (to !== undefined && isSingle('to', to)) {
    toMs = parseDate(to);
    if (toMs === null) details.push({ field: 'to', message: 'to must be a valid date in format YYYY-MM-DD' });
  }

  if (typeof fromMs === 'number' && typeof toMs === 'number' && fromMs > toMs) {
    details.push({ field: 'from', message: 'from must not be later than to' });
  }
  if (typeof fromMs === 'number') filters.fromMs = fromMs;
  if (typeof toMs === 'number') filters.toExclusiveMs = toMs + DAY_MS; // include the whole `to` day

  return { details, filters };
}

// Validates a standalone account id (e.g. a route param). Returns { field, message }[].
function validateAccountId(value) {
  const details = [];
  validateAccount(details, 'accountId', value);
  return details;
}

module.exports = { validateTransaction, validateFilters, validateAccountId };
