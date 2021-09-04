const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getSeasonById = async (client, recruitingSeasonId) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_season
    WHERE id = ?
    `,
    [recruitingSeasonId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getSeasonById };
