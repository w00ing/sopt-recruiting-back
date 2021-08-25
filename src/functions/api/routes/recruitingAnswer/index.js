const { Router } = require('express');

const router = Router();

router.get('/list', require('./recruitingAnswerListGET'));
router.post('/save-to-notion', require('./recruitingAnswerSaveToNotionPOST'));
router.post('/', require('./recruitingAnswerPOST'));

module.exports = router;
