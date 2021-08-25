const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getRecruitingQuestions = async (client) => {
  const rows = await client.query(
    `
    SELECT * FROM recruiting_question
    `,
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

const getRecruitingQuestionsBySeasonAndGroup = async (client, season, group) => {
  const rows = await client.query(
    `
    SELECT rq.*, rqt.type recruiting_question_type, rqt.type_kr recruiting_question_type_kr, rqt.type_legacy recruiting_question_type_legacy FROM recruiting_question rq
    LEFT JOIN recruiting_question_type rqt on rqt.id = rq.recruiting_question_type_id
    WHERE rq.is_deleted = FALSE
    AND rq.is_for_test = FALSE
    AND rq.season = ?
    AND rq.\`group\` = ?
    ORDER BY rq.order
    `,
    [season, group],
  );

  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = {
  getRecruitingQuestions,
  getRecruitingQuestionsBySeasonAndGroup,
};
