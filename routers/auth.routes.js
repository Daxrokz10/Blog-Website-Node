const express = require("express");
const authController = require("../controllers/authController");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

// Login
router.get("/login", authController.login);
router.post("/login", authController.loginHandle);

// Signup
router.get("/signup", authController.signup);
router.post("/signup", authController.signupHandle);
router.post("/signup/send-OTP", authController.sendOTP);
router.post("/signup/verify-OTP", authController.verifyOTP);

// Forgot password
router.get("/forgot-password", authController.verifyEmailForForgetPassPage);
router.post("/forgot-password/email", authController.verifyEmailForForgetPass);
router.post("/forgot-password/verifyOTP", authController.forgotPasswordOTP);
router.post("/forgot-password/reset", authController.forgotPassword);

// Update password
router.get("/updatePassword", isAuth, authController.updatePassword);
router.post("/updatePassword", isAuth, authController.updatePasswordHandle);

// Logout
router.get("/logout", authController.logout);

module.exports = router;
