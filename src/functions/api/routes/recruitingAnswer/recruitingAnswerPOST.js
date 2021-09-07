const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { recruitingApplicantSQL, recruitingAnswerSQL, recruitingAnswerDontReadSQL, recruitingAdminRoleSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { address, birthday, college, email, gender, group, knownPath, leaveAbsence, major, mostRecentSeason, name, part, phone, pic, season, univYear, willAppjam, nearestStation, answers } =
    req.body;

  let client;

  try {
    client = await db.connect(req);

    const existingApplicant = await recruitingApplicantSQL.getRecruitingApplicantBySeasonGroupNameAndPhone(client, season, group, name, phone);
    if (existingApplicant) return res.status(409).json({ err: true, userMessage: '이미 지원하셨습니다.' });

    const applicant = await recruitingApplicantSQL.addRecruitingApplicant(
      client,
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

    const answersWithApplicantId = answers.map((o) => ({ recruitingApplicantId: applicant.id, ...o }));

    const newAnswers = await recruitingAnswerSQL.addRecruitingAnswers(client, answersWithApplicantId);

    res.status(200).json({
      err: false,
      applicant,
      newAnswers,
    });

    const counts = await recruitingApplicantSQL.getApplicantCountBySeasonAndGroupGroupedByPart(client, season, group);
    console.log(counts);
    const totalCount = counts.reduce((a, c) => a + (c.count || 0), 0);

    const slackMessageNewApplicant = `[#${totalCount}] [🔥이모~ 여기 서류 한 잔 추가요~🍺🍺🍺] \n이름: ${applicant.name} \n파트: ${applicant.part} \n번호: ${applicant.phone} \n이메일: ${
      applicant.email
    }\n\n-----------\n\n[${season}기 누적${group} 지원자수]\n전체: ${totalCount}\n--\n${counts.map((c) => `${c.part}: ${c.count}`).join('\n')}`;
    slackAPI.sendMessageToSlack(slackMessageNewApplicant, slackAPI.WEB_HOOK_RECRUITING_MONITORING);
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
