const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');

const { recruitingQuestionSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { season, group } = req.query;

  let client;

  try {
    client = await db.connect(req);

    const questions = await recruitingQuestionSQL.getRecruitingQuestionsBySeasonAndGroup(client, season, group);

    const questionTypes = await recruitingQuestionSQL.getRecruitingQuestionTypes(client);

    const commonQuestions = {
      part: '공통',
      recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'common').id,
      questions: questions.filter((o) => o.recruitingQuestionType === 'common'),
    };

    const partQuestions = [
      {
        part: '기획',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'plan').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'plan'),
      },
      {
        part: '디자인',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'design').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'design'),
      },
      {
        part: '서버',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'server').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'server'),
      },
      {
        part: '안드로이드',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'android').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'android'),
      },
      {
        part: 'iOS',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'ios').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'ios'),
      },
      {
        part: '웹',
        recruitingQuestionTypeId: _.find(questionTypes, (o) => o.type === 'web').id,
        questions: questions.filter((o) => o.recruitingQuestionType === 'web'),
      },
    ];

    res.status(200).json({
      err: false,
      commonQuestions,
      partQuestions,
      questionTypes: questionTypes.filter((o) => o.type !== 'common'),
    });
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(500).json({ err: error, userMessage: error.message });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uname:${req.user.firstName} email:${req.user.email} uid:${req.user.id}` : 'req.user 없음'} 
 ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }
};
