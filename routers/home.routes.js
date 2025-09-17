const express = require("express");
const homeController = require("../controllers/homeController");
const { isAuth } = require("../middlewares/auth");
const uploadProfile = require("../middlewares/uploadProfile");

const router = express.Router();

router.get("/", homeController.defaultRoute);

router.get("/admin", homeController.homePageAdmin);
router.get("/blog", homeController.homePageReader);
router.get("/write", homeController.homePageWriter);

router.get("/profile", homeController.profilePage);

// Edit bio
router.get("/editBio", isAuth, homeController.editBio);
router.post("/editBio", isAuth, uploadProfile.single("profilePicture"), homeController.editBioHandle);

// Delete user
router.get("/sureDeleteUser", isAuth, homeController.sureDeleteUser);
router.post("/deleteUser", isAuth, homeController.deleteUser);

module.exports = router;
