const functions = require('firebase-functions');
const axios = require('axios');

const dotenv = require('dotenv');

dotenv.config();

const devMode = process.env.NODE_ENV === 'development';

const WEB_HOOK_ERROR_MONITORING = process.env.WEB_HOOK_ERROR_MONITORING;
const WEB_HOOK_RECRUITING_MONITORING = process.env.WEB_HOOK_RECRUITING_MONITORING;

const sendMessageToSlack = (message, apiEndPoint = WEB_HOOK_ERROR_MONITORING) => {
  if (devMode) return;

  try {
    axios
      .post(apiEndPoint, { text: message })
      .then((response) => {})
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    console.error(e);
    functions.logger.error('[slackAPI 에러]', { error: e });
  }
};
module.exports = {
  sendMessageToSlack,
  WEB_HOOK_ERROR_MONITORING,
  WEB_HOOK_RECRUITING_MONITORING,
};
