const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingAdminRoles = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_admin_role
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};
module.exports = { getRecruitingAdminRoles };
