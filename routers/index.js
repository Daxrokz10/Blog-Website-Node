const express = require('express');
const homeRouter = require('./home.routes');
const router = express.Router();

router.use('/',homeRouter);

module.exports = router;
