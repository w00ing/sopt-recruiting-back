const { Router } = require('express');
const { checkAdmin } = require('../../../middlewares/auth');

const router = Router();

router.get('/list', require('./recruitingQuestionListGET'));
router.post('/', checkAdmin, require('./recruitingQuestionPOST'));
router.put('/', checkAdmin, require('./recruitingQuestionPUT'));
router.delete('/', checkAdmin, require('./recruitingQuestionDELETE'));

module.exports = router;
