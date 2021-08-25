const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingAnswers = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_answer
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const addRecruitingAnswer = async (client, recruitingApplicantId, recruitingQuestionId, answer) => {
  const rows = await client.query(
    `
  INSERT INTO recruiting_applicant
  (recruiting_applicant_id, recruiting_question_id, answer)
  VALUES
  (?, ?, ?)
  RETURNING *
  `,
    [recruitingApplicantId, recruitingQuestionId, answer],
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
  getRecruitingAnswersByRecruitingQuestionIds,
};
