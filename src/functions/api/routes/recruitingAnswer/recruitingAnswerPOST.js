const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { recruitingApplicantSQL, recruitingAnswerSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const {
    address,
    birthday,
    college,
    email,
    gender,
    group,
    knownPath,
    leaveAbsence,
    major,
    mostRecentSeason,
    name,
    part,
    phone,
    pic,
    season,
    univYear,
    willAppjam,
    nearestStation,
    recruitingApplicantId,
    recruitingQuestionId,
    answer,
  } = req.body;

  let client;

  try {
    client = await db.connect(req);

    const applicant = await recruitingApplicantSQL.addRecruitingApplicant(
      client,
      recruitingApplicantId,
      address,
      birthday,
      college,
      email,
      gender,
      group,
      knownPath,
      leaveAbsence,
      major,
      mostRecentSeason,
      name,
      part,
      phone,
      pic,
      season,
      univYear,
      willAppjam,
      nearestStation,
    );

    const newAnswer = await recruitingAnswerSQL.addRecruitingAnswer(client, applicant.id, recruitingQuestionId, answer);

    // throw new Error();

    res.status(200).json({
      err: false,
      applicant,
      newAnswer,
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
