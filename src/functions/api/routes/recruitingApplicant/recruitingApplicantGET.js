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
  const { recruitingApplicantId } = req.query;
  if (!recruitingApplicantId) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const applicant = await recruitingApplicantSQL.getRecruitingApplicantById(client, recruitingApplicantId);
    if (!applicant) return res.status(404).json({ err: true, userMessage: 'No corresponding content.' });

    const answers = await recruitingAnswerSQL.getRecruitingAnswersByRecruitingApplicantId(client, applicant.id);

    const recruitingQuestionIds = arrayHandlers.extractValues(answers, 'recruitingQuestionId');

    const questions = await recruitingQuestionSQL.getRecruitingQuestionsByIds(client, recruitingQuestionIds);

    for (let i = 0; i < questions.length; i++) {
      questions[i].answer = _.find(answers, (o) => o.recruitingQuestionId === questions[i].id);
    }

    const [commonQuestions, partQuestions] = _.partition(questions, (o) => o.recruitingQuestionTypeId === 1);

    res.status(200).json({
      err: false,
      applicant,
      commonQuestions,
      partQuestions,
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
