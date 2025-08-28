const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { isAuth, allowUsers } = require('../middlewares/auth');
const ctrl = require('../controllers/postController');

// create
router.get('/new', isAuth, ctrl.createForm);
router.post('/', isAuth, upload.single('cover'), ctrl.create);

// read
router.get('/:id', allowUsers, ctrl.show);

// social
router.post('/:id/like', isAuth, ctrl.toggleLike);
router.post('/:id/comments', isAuth, ctrl.addComment);

module.exports = router;
