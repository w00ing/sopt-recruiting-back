const { map } = require('lodash');

const extractValues = (arr, key) => {
  if (!Array.isArray(arr)) return [arr[key] || null];
  return [...new Set(arr.map((o) => o[key]).filter(Boolean))];
};

const extractValuesIncludingNullsAndDuplicates = (arr, key) => {
  if (!Array.isArray(arr)) return [arr[key] || null];
  let values = [];
  for (let i = 0; i < arr.length; i++) {
    if (!arr[i][key]) {
      values.push(null);
    } else {
      values.push(arr[i][key]);
    }
  }
  return values;
};
function isNestedArray(arr) {
  if (!Array.isArray(arr)) {
    return false;
  }
  if (Array.isArray(arr[0])) {
    return true;
  }
  return false;
}
``;

function flatten(arr) {
  if (isNestedArray(arr)) return arr.flat();
  else {
    let newArr = [];
    arr.map((o) => {
      newArr.push(...Object.values(o));
    });
    return newArr;
  }
}

const postWithNullOnSql = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === String) {
      console.log('daslkjlkj', "'" + `''${arr[i]}''` + "'");
      arr[i] = `'${arr[i]}'`;
    } else if (!arr[i]) {
      arr[i] = 'NULL';
    } else {
    }
  }
  console.log('dkashgjdlfk', arr, arr.join());
  return arr;
};

const expand = (arr, columnCount = 1, startAt = 1) => {
  const rowCount = arr.length;
  let index = startAt;
  const result = Array(rowCount)
    .fill(0)
    .map(
      (v) =>
        `(${Array(columnCount)
          .fill(0)
          .map((v) => `?`)
          .join(', ')})`,
    )
    .join(', ');
  if (columnCount === 1) return `(${result})`;
  else return result;
};

module.exports = { extractValues, extractValuesIncludingNullsAndDuplicates, isNestedArray, expand, flatten, postWithNullOnSql };
