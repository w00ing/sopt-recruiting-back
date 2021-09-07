const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');
const notionHandlers = require('../../../lib/notionHandlers');

const { recruitingQuestionSQL, legacySQL, recruitingApplicantSQL, recruitingAnswerSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { season, group } = req.body;

  const parts = ['android', 'design', 'iOS', 'plan', 'server', 'web'];

  let client;

  try {
    client = await db.connect(req);

    // const notionDb = await notionHandlers.setDatabase('OB 지원 서류');

    // const applicants = await legacySQL.getApplicants29OB(client, lastIndex);
    const applicants = await recruitingApplicantSQL.getRecruitingApplicantsBySeasonAndGroup(season, group);

    const applicantIds = arrayHandlers.extractValues(applicants, 'id');
    const answers = await recruitingAnswerSQL.getRecruitingAnswersByRecruitingApplicantIds(client, applicantIds);
    // const []

    // for (let i = 0; i < .length; i++) {
    //       [i].
    // }

    let partAnswers = [];

    for (let i = 0; i < parts.length; i++) {
      const answer = await legacySQL.getAnswers29OBByPart(client, parts[i]);
      partAnswers.push(...answer);
    }

    // partAnswers = partAnswers.flat();

    for (let i = 0; i < applicants.length; i++) {
      applicants[i].commonAnswers = _.values(_.pickBy(applicants[i], (value, key) => key.includes('Question')));
      applicants[i].partAnswers = _.values(
        _.pickBy(
          _.find(partAnswers, (o) => Number(o.candidate) === Number(applicants[i].id)),
          (value, key) => key.includes('Question'),
        ),
      );
    }

    const questions = await recruitingQuestionSQL.getRecruitingQuestionsBySeasonAndGroup(client, 29, 'OB');

    const [commonQuestions, partQuestions] = _.partition(questions, (o) => o.recruitingQuestionTypeId === 1);

    const notionRes = [];

    for (let i = 0; i < applicants.length; i++) {
      const result = await notionHandlers.createPageLegacy(
        commonQuestions,
        partQuestions.filter((o) => o.recruitingQuestionTypeLegacy === applicants[i].part),
        applicants[i],
      );
      notionRes.push(result);
    }

    res.status(200).json({
      err: false,
      notionRes,
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
