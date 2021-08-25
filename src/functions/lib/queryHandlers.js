function expand(arr, columnCount = 1, startAt = 1) {
  const rowCount = arr.length;
  var index = startAt;
  const result = Array(rowCount)
    .fill(0)
    .map(
      (v) =>
        `(${Array(columnCount)
          .fill(0)
          .map((v) => `$${index++}`)
          .join(', ')})`,
    )
    .join(', ');
  if (columnCount === 1) return `(${result})`;
  else return result;
}

module.exports = { expand };
