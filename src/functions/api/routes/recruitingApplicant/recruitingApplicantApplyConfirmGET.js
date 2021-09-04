const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');

const { recruitingApplicantSQL, recruitingAnswerSQL, recruitingQuestionSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { season, group, name, phone } = req.query;
  if (!name || !phone || !season || !group) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const applicant = await recruitingApplicantSQL.getRecruitingApplicantBySeasonGroupNameAndPhone(client, season, group, name, phone);
    if (!applicant) return res.status(404).json({ err: true, userMessage: '지원자 정보가 없습니다.' });

    res.status(200).json({
      err: false,
      applicant,
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
