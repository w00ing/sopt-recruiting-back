const { Router } = require('express');

const router = Router();

router.get('/', require('./recruitingAdminGET'));

module.exports = router;
