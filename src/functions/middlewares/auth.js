const functions = require('firebase-functions');
const { serializeError } = require('serialize-error');
const { TOKEN_EXPIRED, TOKEN_INVALID } = require('../constants/jwt');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');
const jwtHandlers = require('../lib/jwtHandlers');
const { userSQL } = require('../sql');
const db = require('../sql/db');

const slackAPI = require('./slackAPI');

const checkUser = async (req, res, next) => {
  let client;
  try {
    client = await db.connect(req);

    let user;

    const { isweb } = req.headers;
    const authHeader = String(req.headers.authorization || '');

    if (!authHeader) return res.status(400).send({ err: true, userMessage: 'No auth header' });
    const token = authHeader.substring(7, authHeader.length);
    if (!token) return res.status(400).send({ err: true, userMessage: 'Empty token' });

    if (isweb) {
      const decodedToken = jwtHandlers.verify(token);
      if (decodedToken === TOKEN_EXPIRED) return res.status(401).send({ err: true, userMessage: 'Expired token' });
      if (decodedToken === TOKEN_INVALID) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      const id = decodedToken.id;
      if (!id) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      user = await userSQL.getUserById(client, id);
    } else {
      const idFirebase = token;
      user = await userSQL.getUserByIdFirebase(client, idFirebase);
    }

    if (!user) return res.status(401).send({ err: true, userMessage: 'No such user' });

    req.user = user;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`email: ${user.email} uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
    functions.logger.log(`email: ${user.email} uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
  } catch (error) {
    console.log(error);
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: true, userMessage: 'Error occurred' });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uname:${req.user.firstName} email:${req.user.email} uid:${req.user.id}` : `req.user 없음`} 
      ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }

  next();
};

const checkAdmin = async (req, res, next) => {
  let client;
  try {
    client = await db.connect(req);

    let user;

    const { isweb } = req.headers;
    const authHeader = String(req.headers.authorization || '');
    if (!authHeader) return res.status(400).send({ err: true, userMessage: 'No auth header' });
    const token = authHeader.substring(7, authHeader.length);
    if (!token) return res.status(400).send({ err: true, userMessage: 'Empty token' });

    if (isweb) {
      const decodedToken = jwtHandlers.verify(token);
      if (decodedToken === TOKEN_EXPIRED) return res.status(401).send({ err: true, userMessage: 'Expired token' });
      if (decodedToken === TOKEN_INVALID) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      const id = decodedToken.id;
      if (!id) return res.status(401).send({ err: true, userMessage: 'Invalid token' });

      user = await userSQL.getAdminUserById(client, id);
    } else {
      const idFirebase = token;
      user = await userSQL.getAdminUserByIdFirebase(client, idFirebase);
    }

    if (!user) return res.status(401).send({ err: true, userMessage: 'No such user' });

    req.user = user;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
    functions.logger.log(`uid: ${user.id}`, ip, user.firstName, user.lastName, `[${req.method.toUpperCase()}]`, req.originalUrl);
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(500).json({ err: true, userMessage: 'Error occurred' });

    const slackMessage = `[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl} ${req.user ? `uname:${req.user.firstName} email:${req.user.email} uid:${req.user.id}` : `req.user 없음`} 
      ${JSON.stringify(serializeError(error))}`;
    slackAPI.sendMessageToSlack(slackMessage, slackAPI.DEV_WEB_HOOK_ERROR_MONITORING);
  } finally {
    client.release();
  }

  next();
};

module.exports = { checkUser, checkAdmin };
