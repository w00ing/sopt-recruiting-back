const { Router } = require('express');

const router = Router();

router.use('/legacy', require('./legacy'));

router.use('/auth', require('./auth'));

router.use('/recruiting-admin', require('./recruitingAdmin'));
router.use('/recruiting-answer-dont-read', require('./recruitingAnswerDontRead'));
router.use('/recruiting-answer', require('./recruitingAnswer'));
router.use('/recruiting-applicant', require('./recruitingApplicant'));
router.use('/recruiting-question', require('./recruitingQuestion'));

module.exports = router;
