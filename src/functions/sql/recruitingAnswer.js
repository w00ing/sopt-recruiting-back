const { expand, flatten } = require('../lib/arrayHandlers');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingAnswers = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingAnswersByRecruitingApplicantId = async (client, recruitingApplicantId) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer
    WHERE recruiting_applicant_id = ?
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
    [recruitingApplicantId],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingAnswersByRecruitingApplicantIds = async (client, recruitingApplicantIds) => {
  if (recruitingApplicantIds.length < 1) return [];
  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer
    WHERE recruiting_applicant_id IN (${recruitingApplicantIds.join()})
    AND is_deleted = FALSE
    AND is_for_test = FALSE
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const addRecruitingAnswer = async (client, recruitingApplicantId, recruitingQuestionId, answer) => {
  const rows = await client.query(
    `
  INSERT INTO recruiting_answer
  (recruiting_applicant_id, recruiting_question_id, answer)
  VALUES
  (?, ?, ?)
  RETURNING *
  `,
    [recruitingApplicantId, recruitingQuestionId, answer],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addRecruitingAnswers = async (client, answersWithApplicantId) => {
  const rows = await client.query(
    `
  INSERT INTO recruiting_answer
  (recruiting_applicant_id, recruiting_question_id, answer)
  VALUES
  ${expand(answersWithApplicantId, 3)}
  RETURNING *
  `,
    flatten(answersWithApplicantId),
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRecruitingAnswersByRecruitingQuestionIds = async (client, recruitingQuestionIds) => {
  if (recruitingQuestionIds.length < 1) return [];
  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer
    WHERE recruiting_question_id IN (${recruitingQuestionIds.join()})
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getRecruitingAnswers,
  addRecruitingAnswer,
  addRecruitingAnswers,
  getRecruitingAnswersByRecruitingQuestionIds,
  getRecruitingAnswersByRecruitingApplicantId,
  getRecruitingAnswersByRecruitingApplicantIds,
};
