const { Router } = require('express');
const { checkAdmin } = require('../../../middlewares/auth');

const router = Router();

router.get('/apply-confirm', require('./recruitingApplicantApplyConfirmGET'));

router.post('/save-to-notion', checkAdmin, require('./recruitingApplicantSaveToNotionPOST'));
router.get('/list', checkAdmin, require('./recruitingApplicantListGET'));
router.get('/parts', checkAdmin, require('./recruitingApplicantPartsGET'));
router.get('/', checkAdmin, require('./recruitingApplicantGET'));

module.exports = router;
