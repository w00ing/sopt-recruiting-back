const { Router } = require('express');

const router = Router();

router.get('/save-applicants-29-ob-to-notion', require('./saveApplicants29OBtoNotionPOST'));

module.exports = router;
