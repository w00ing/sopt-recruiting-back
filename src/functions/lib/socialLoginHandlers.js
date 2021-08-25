const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_WEB_CLIENT_ID);

const decodeGoogleIdToken = async (idToken) => {
  console.log(GOOGLE_WEB_CLIENT_ID);
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID],
    });

    const payload = ticket.getPayload();
    const uid = payload['sub'];
    return payload;
  } catch (e) {
    console.log('error message', e);
    throw e;
  }
};

const decodeAppleIdToken = (token) => {
  return jwt.decode(token);
};

module.exports = { decodeGoogleIdToken, decodeAppleIdToken };
