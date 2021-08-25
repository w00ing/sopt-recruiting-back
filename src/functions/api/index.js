const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const hpp = require('hpp');
const helmet = require('helmet');
const slackAPI = require('../middlewares/slackAPI');

dotenv.config();

const app = express();

app.use(cors());

if (process.env.NODE_ENV === 'production') {
  // app.use(morgan('combined'));
  app.use(hpp());
  app.use(helmet());
} else {
  // app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/', require('./routes'));
app.use('*', (req, res) => {
  slackAPI.sendMessageToSlack(`잘못된 API 호출 [${req.method}] ${req.originalUrl}`);
  res.status(404).json({ message: '잘못된 경로입니다.' });
});

module.exports = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '512MB',
  })
  .region('asia-northeast3')
  .https.onRequest(async (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n\n', '[api]', `[${req.method.toUpperCase()}]`, req.originalUrl, req.headers.currentbuildno, req.headers.timezone, req.body);
    } else {
      console.log('[api]', `${req.method.toUpperCase}`, req.originalUrl, req.headers.currentbuildno, req.headers.timezone, req.body);
    }
    return app(req, res);
  });
