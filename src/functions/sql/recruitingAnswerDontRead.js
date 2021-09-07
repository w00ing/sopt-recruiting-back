const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingAnswerDontReadsByRecruitingApplicantIds = async (client, recruitingApplicantIds) => {
  if (recruitingApplicantIds.length < 1) return [];
  const rows = await client.query(
    `
    SELECT recruiting_answer_dont_read.*, recruiting_admin_role.role, recruiting_admin_role.primary_color
    FROM recruiting_answer_dont_read
      LEFT JOIN recruiting_admin_role ON recruiting_admin_role.id = recruiting_answer_dont_read.recruiting_admin_role_id
    WHERE recruiting_answer_dont_read.is_deleted = FALSE
      AND recruiting_admin_role.is_deleted = FALSE
      AND recruiting_answer_dont_read.recruiting_applicant_id IN (${recruitingApplicantIds.join()})
    ORDER BY recruiting_answer_dont_read.created_at
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const addRecruitingAnswerDontRead = async (client, recruitingApplicantId, recruitingAdminRoleIds) => {
  const rows = await client.query(
    `
    INSERT INTO recruiting_answer_dont_read
    (recruiting_applicant_id, recruiting_admin_role_id)
    ${recruitingAdminRoleIds.map((o) => `(?, ?)`).join(' ')}
    VALUES (?, ?)
    RETURNING *
    `,
    [recruitingApplicantId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteRecruitingAnswerDontRead = async (client, recruitingAnswerDontReadId) => {
  await client.query(
    `
    UPDATE recruiting_answer_dont_read
    SET is_deleted = TRUE, updated_at = now()
    WHERE id = ${recruitingAnswerDontReadId}
    `,
  );

  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer_dont_read
    WHERE id = ${recruitingAnswerDontReadId}
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getRecruitingAnswerDontReadsByRecruitingApplicantIds, addRecruitingAnswerDontRead, deleteRecruitingAnswerDontRead };
