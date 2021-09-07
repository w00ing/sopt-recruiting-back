const { Router } = require('express');
const { checkAdmin } = require('../../../middlewares/auth');

const router = Router();

router.get('/list', checkAdmin, require('./recruitingAnswerListGET'));
router.post('/save-to-notion', checkAdmin, require('./recruitingAnswerSaveToNotionPOST'));
router.post('/', require('./recruitingAnswerPOST'));

module.exports = router;
