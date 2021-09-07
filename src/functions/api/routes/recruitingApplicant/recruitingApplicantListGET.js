const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');

const { recruitingApplicantSQL, recruitingQuestionSQL, recruitingAdminRoleSQL, recruitingAnswerDontReadSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { season, group, offset, limit, nameSearchKeyword, part } = req.query;
  if (!season || !group) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const adminRoles = await recruitingAdminRoleSQL.getRecruitingAdminRoles(client);
    const questionTypes = await recruitingQuestionSQL.getRecruitingQuestionTypes(client);

    const applicants = await recruitingApplicantSQL.getRecruitingApplicantsBySeasonAndGroupWithOffsetLimitAndNameSearchKeywordAndPart(client, season, group, offset, limit, nameSearchKeyword, part);

    // const applicantIds = arrayHandlers.extractValues(applicants, 'id');

    // const dontReads = await recruitingAnswerDontReadSQL.getRecruitingAnswerDontReadsByRecruitingApplicantIds(client, applicantIds);

    // for (let i = 0; i < applicants.length; i++) {
    //   applicants[i].dontReads = _.filter(dontReads, (o) => o.recruitingApplicantId === applicants[i].id);
    // }

    const { count } = await recruitingApplicantSQL.getApplicantCountBySeasonAndGroup(client, season, group);

    res.status(200).json({
      err: false,
      meta: {
        total: count,
        totalPage: parseInt(count / limit) + 1,
      },
      adminRoles,
      applicants,
      questionTypes,
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
