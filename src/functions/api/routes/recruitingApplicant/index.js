const { Router } = require('express');
const { checkAdmin } = require('../../../middlewares/auth');

const router = Router();

router.get('/apply-confirm', require('./recruitingApplicantApplyConfirmGET'));

router.get('/list', checkAdmin, require('./recruitingApplicantListGET'));
router.get('/', checkAdmin, require('./recruitingApplicantGET'));

module.exports = router;
