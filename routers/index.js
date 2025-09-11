const express = require('express');
const homeRouter = require('./home.routes');
const postRouter = require('./post.routes');
const { addFlash } = require('../middlewares/flash');
const router = express.Router();

router.use(addFlash);

router.use('/',homeRouter);
router.use('/posts',postRouter);

module.exports = router;
