const apis = require('./api');
const router = require('express').Router();

router.use('/api/v1', apis);
module.exports = router;
