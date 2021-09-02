const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingQuestions = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_question
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingQuestionTypes = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_question_type
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingQuestionsBySeasonAndGroup = async (client, season, group, isForTest = false) => {
  const rows = await client.query(
    `
    SELECT rq.*, rqt.type recruiting_question_type, rqt.type_kr recruiting_question_type_kr, rqt.type_legacy recruiting_question_type_legacy
    FROM recruiting_question rq
      LEFT JOIN recruiting_question_type rqt on rqt.id = rq.recruiting_question_type_id
    WHERE rq.is_deleted = FALSE
      AND rq.is_for_test = ?
      AND rq.season = ?
      AND rq.\`group\` = ?
    ORDER BY rq.order
    `,
    [isForTest, season, group],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const addRecruitingQuestion = async (client, group, season, recruitingQuestionTypeId, order) => {
  const rows = await client.query(
    `
    INSERT INTO recruiting_question
    (\`group\`, season, recruiting_question_type_id, \`order\`)
    VALUES
    (?, ?, ?, ?)
    RETURNING *
    `,
    [group, season, recruitingQuestionTypeId, order],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateRecruitingQuestionById = async (client, recruitingQuestionId, question, charLimit) => {
  await client.query(
    `
    UPDATE recruiting_question
    SET question = ?, char_limit = ?, updated_at = now()
    WHERE id = ${recruitingQuestionId}
    `,
    [question, charLimit],
  );

  const rows = await client.query(
    `
    SELECT * FROM recruiting_question
    WHERE id = ?
    `,
    [recruitingQuestionId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deleteRecruitingQuestionById = async (client, recruitingQuestionId) => {
  await client.query(
    `
    UPDATE recruiting_question
    SET is_deleted = TRUE, updated_at = now()
    WHERE id = ${recruitingQuestionId}
    `,
  );

  const rows = await client.query(
    `
    SELECT * FROM recruiting_question
    WHERE id = ?
    `,
    [recruitingQuestionId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = {
  getRecruitingQuestions,
  getRecruitingQuestionTypes,
  getRecruitingQuestionsBySeasonAndGroup,
  addRecruitingQuestion,
  updateRecruitingQuestionById,
  deleteRecruitingQuestionById,
};
