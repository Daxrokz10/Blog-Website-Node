const express = require("express");
const homeRouter = require("./home.routes");
const authRouter = require("./auth.routes");
const postRouter = require("./post.routes");
const { addFlash } = require("../middlewares/flash");

const router = express.Router();

router.use(addFlash);

// Auth routes
router.use("/", authRouter);

// Home/dashboard/profile routes
router.use("/", homeRouter);

// Posts routes
router.use("/posts", postRouter);

module.exports = router;
