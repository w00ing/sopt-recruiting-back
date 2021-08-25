const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');
const notionHandlers = require('../../../lib/notionHandlers');
const { recruitingAnswerSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const {} = req.query;
  const {} = req.body;

  let client;

  try {
    client = await db.connect(req);

    // const answers = await recruitingAnswerSQL.getRecruitingAnswersByRecruitingQuestionIds(client, [1, 3]);

    const answer = { answer: 'answer' };
    const question = { order: 1, question: 'question' };
    const notion = await notionHandlers.createPage(1, 'name', 'college', 'part', 'major', 'phone', question, answer);

    res.status(200).json({
      err: false,
      answer,
      question,
      notion,
    });
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    res.status(500).json({ err: error, userMessage: error.message });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uname:${req.user.firstName} email:${req.user.email} uid:${req.user.id}` : 'req.user 없음'} 
 ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_RECRUITING_MONITORING);
  } finally {
    client.release();
  }
};
