const _ = require('lodash');

const getAcceptanceRateColor = (rate) => {
  if (!rate || rate * 100 === 0) return '#292A2F';
  const percentage = rate * 100;
  if (0 < percentage && percentage <= 5) return '#FF6565';
  if (5 < percentage && percentage <= 20) return '#FF9C65';
  if (20 < percentage && percentage <= 40) return '#6865FF';
  if (40 < percentage && percentage <= 100) return '#08C6A4';
  return '#292A2F';
};

const createUrlStringFromString = (str) => {
  return str && str.trim().length !== 0 ? _.kebabCase(str.trim()) : null;
};

module.exports = { getAcceptanceRateColor, createUrlStringFromString };
