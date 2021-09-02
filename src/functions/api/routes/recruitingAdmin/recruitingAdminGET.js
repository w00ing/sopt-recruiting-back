const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const arrayHandlers = require('../../../lib/arrayHandlers');
const { recruitingAdminSQL } = require('../../../sql');

module.exports = async (req, res) => {
  const { idFirebase } = req.query;

  let client;

  try {
    client = await db.connect(req);

    const user = await recruitingAdminSQL.getRecruitingAdminByIdFirebase(client, idFirebase);

    res.status(200).json({
      err: false,
      user,
    });
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: error, userMessage: error.message });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uname:${req.user.firstName} email:${req.user.email} uid:${req.user.id}` : 'req.user 없음'} 
 ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }
};
