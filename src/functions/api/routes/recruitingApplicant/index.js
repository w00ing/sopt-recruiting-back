const { Router } = require('express');

const router = Router();

router.get('/list', require('./recruitingApplicantListGET'));

module.exports = router;
