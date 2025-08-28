const express = require('express');
const homeRouter = require('./home.routes');
const postRouter = require('./post.routes');
const router = express.Router();

router.use('/',homeRouter);
router.use('/posts',postRouter);

module.exports = router;
