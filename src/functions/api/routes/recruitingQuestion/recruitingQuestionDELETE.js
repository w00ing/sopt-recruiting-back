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
  const { recruitingQuestionId } = req.query;
  if (!recruitingQuestionId) return res.status(404).json({ err: true, message: '필요한 값이 없습니다.' });

  let client;

  try {
    client = await db.connect(req);

    const deletedQuestion = await recruitingQuestionSQL.deleteRecruitingQuestionById(client, recruitingQuestionId);

    res.status(200).json({
      err: false,
      question: deletedQuestion,
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
