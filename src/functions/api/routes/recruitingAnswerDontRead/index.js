const { Router } = require('express');
const { checkAdmin } = require('../../../middlewares/auth');

const router = Router();

router.post('/', checkAdmin, require('./recruitingAnswerDontReadPOST'));
router.delete('/', checkAdmin, require('./recruitingAnswerDontReadDELETE'));

module.exports = router;
