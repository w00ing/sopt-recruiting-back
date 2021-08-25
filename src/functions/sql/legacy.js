const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getApplicants29OB = async (client) => {
  const rows = await client.query(
    `
   SELECT * FROM OB_29 WHERE id > 17
   `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getAnswers29OBByPart = async (client, part) => {
  const rows = await client.query(
    `
   SELECT * FROM OB_29_${part}
   `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getApplicants29OB,
  getAnswers29OBByPart,
};
