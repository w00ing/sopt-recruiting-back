const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const _ = require('lodash');
const dayjs = require('dayjs');
const numeral = require('numeral');

const db = require('../../../sql/db');
const slackAPI = require('../../../middlewares/slackAPI');
const { userSQL } = require('../../../sql');
const jwtHandlers = require('../../../lib/jwtHandlers');

module.exports = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(404).json({ err: true, userMessage: 'Not enough parameters.' });

  const { isweb } = req.headers;

  let client;

  try {
    client = await db.connect(req);

    const userFirebase = await admin
      .auth()
      .createUser({ email, password })
      .then((user) => user)
      .catch((e) => {
        functions.logger.error(e);
        return {
          err: true,
          error: e,
        };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/email-already-exists') {
        return res.status(404).json({ err: true, userMessage: 'A user with this email already exists, or has withdrawn.' });
      } else if (userFirebase.error.code === 'auth/invalid-password') {
        return res.status(404).json({ err: true, userMessage: 'Please check if your password is valid.' });
      } else {
        return res.status(500).json({ err: true, userMessage: 'An unknown error occurred while signing you up. Please contact customer service.' });
      }
    } else {
      try {
        await client.query('BEGIN');
        console.log(userFirebase);

        const user = await userSQL.addUserWithIdFirebase(client, email, userFirebase.uid);
        console.log('usercreated', user);

        const idFirebase = user.idFirebase;
        const firebaseToken = await admin.auth().createCustomToken(userFirebase.uid, { status: 'EMAIL_SIGN_UP' });

        const { accesstoken } = jwtHandlers.sign(user);
        await client.query('COMMIT');
        console.log(user);

        res.status(200).json({
          err: false,
          user,
          idFirebase,
          firebaseToken,
          accesstoken,
        });
        slackAPI.sendMessageToSlack(`[NEW USER] [EMAIL] email:${email}, uid:${user.id}`, slackAPI.WEB_HOOK_ERROR_MONITORING);
      } catch (error) {
        await client.query('ROLLBACK');
        functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
        console.log(error);
        res.status(500).json({ err: error, userMessage: error.message || 'An error occurred during signup process.' });
        slackAPI.sendMessageToSlack(`[ERROR: EMAIL SIGNUP] email:${email}`, slackAPI.WEB_HOOK_ERROR_MONITORING);
      }
    }
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: error, userMessage: error.message });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `email:${req.user.email} uid:${req.user.id}` : 'req.user 없음'}
 ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }
};
