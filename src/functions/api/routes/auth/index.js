const { Router } = require('express');

const router = Router();

router.post('/login/email', require('./authLoginEmailPOST'));
router.get('/sign-up/email', require('./authSignUpEmailPOST'));

module.exports = router;
