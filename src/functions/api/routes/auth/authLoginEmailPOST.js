const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { recruitingAdminSQL } = require('../../../sql');
const jwtHandlers = require('../../../lib/jwtHandlers');

module.exports = async (req, res) => {
  const { email, idFirebase } = req.body;

  if (!email || !idFirebase) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  let client;

  try {
    client = await db.connect(req);

    const user = await recruitingAdminSQL.getUserByEmailAndIdFirebaseIncludingDeleted(client, email, idFirebase);

    if (!user) return res.status(404).json({ err: true, userMessage: 'No such user. Please check your email.' });
    else if (user.isDeleted) return res.status(403).json({ err: true, userMessage: `The user with email address ${email} has withdrawn.` });

    const { accesstoken } = jwtHandlers.sign(user);
    res.status(200).json({
      err: false,
      user,
      accesstoken,
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
