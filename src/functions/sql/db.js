require('dotenv').config();
const functions = require('firebase-functions');
const dayjs = require('dayjs');
const mariadb = require('mariadb');
const slackAPI = require('../middlewares/slackAPI');

let devMode = process.env.NODE_ENV === 'development';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 60 * 1000,
  idleTimeout: 60,
  connectionLimit: 200,
});

const connect = (req) => {
  const now = dayjs();

  const string =
    !!req && !!req.method
      ? `[${req.method}] ${!!req.user ? `${req.user.id} (${req.headers.currentbuildno})` : ``} ${req.originalUrl}\n ${!!req.query && `${JSON.stringify(req.query)}`} ${
          !!req.body && `${JSON.stringify(req.body)}`
        }`
      : `request 없음`;
  const callStack = new Error().stack;
  const releaseChecker = setTimeout(() => {
    functions.logger.error('[ERROR] release not called in a minute', {
      callStack,
    });
    slackAPI.sendMessageToSlack(`[ERROR] release not called in 30 sec\n${string}\n${JSON.stringify(callStack)}`, slackAPI.WEB_HOOK_ERROR_MONITORING);
  }, 15 * 1000);

  return pool.getConnection().then((client) => {
    client.release = ((origFunc) =>
      function () {
        clearTimeout(releaseChecker);
        origFunc.apply(client, arguments);
        const time = dayjs().diff(now, 'millisecond');
        if (time > 4000) {
          const message = `[RELEASE] in ${time} | ${string}`;
          devMode && console.log(message);
          // slackAPI.sendMessageToSlack(message, slackAPI.WEB_HOOK_ERROR_MONITORING);
        }
      })(client.release);
    return client;
  });
};

module.exports = { connect };
