const { Router } = require('express');

const router = Router();

router.get('/list', require('./recruitingQuestionListGET'));

module.exports = router;
