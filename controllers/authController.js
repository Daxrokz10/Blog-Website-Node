const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("connect-flash");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

let tempUser;

module.exports.login = (req, res) => {
  return res.render("./pages/auth/login");
};

module.exports.loginHandle = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login?error=1");

    req.logIn(user, (err) => {
      if (err) return next(err);
      if (user.role === "admin") {
        return res.redirect("/admin");
      } else {
        if (user.verifiedStatus === false) {
          req.flash("error", "Email not verified!");
        }
        return res.redirect("/blog");
      }
    });
  })(req, res, next);
};

module.exports.signup = (req, res) => {
  return res.render("./pages/auth/signup/signup");
};

module.exports.signupHandle = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.redirect("/?signupError=1");
    }

    req.session.userData = { username, email, password, role };
    return res.render("./pages/auth/signup/sendOTP", { userData: req.session.userData });
  } catch (error) {
    console.log(error.message);
    return res.redirect("/signup");
  }
};

module.exports.sendOTP = async (req, res) => {
  try {
    if (!req.session.userData) {
      req.flash("error", "No signup data found. Please signup again.");
      return res.redirect("/signup");
    }

    const { username, email } = req.session.userData;
    const otp = crypto.randomInt(100000, 999999).toString();
    req.session.otp = otp;
    console.log("Signup OTP:", otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hello ${username}, your OTP is: ${otp}`,
    });

    req.flash("success", "OTP sent successfully");
    return res.render("./pages/auth/signup/verifyOTP");
  } catch (error) {
    console.error("Error sending OTP:", error);
    req.flash("error", "Could not send OTP. Try again.");
    return res.redirect("/signup");
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (otp === req.session.otp) {
      const hashed = await bcrypt.hash(req.session.userData.password, 10);

      await User.create({
        username: req.session.userData.username,
        email: req.session.userData.email,
        password: hashed,
        role: req.session.userData.role,
        verifiedStatus: true,
      });

      req.session.otp = null;
      req.session.userData = null;

      req.flash("success", "Signup successful! Please login.");
      return res.redirect("/login");
    } else {
      req.flash("error", "Invalid OTP, try again.");
      return res.redirect("/errorpage");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    req.flash("error", "Verification failed.");
    return res.redirect("/signup");
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
};

// Update password (inside profile)
module.exports.updatePassword = (req, res) => {
  return res.render("./pages/auth/updatePassword/updatePassword");
};

module.exports.updatePasswordHandle = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      req.flash("error", "Current password is incorrect");
      return res.redirect("/updatePassword");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "New password and confirm password don’t match");
      return res.redirect("/updatePassword");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    req.flash("success", "Password updated successfully");
    return res.redirect("/logout");
  } catch (error) {
    console.log(error);
    req.flash("error", "Unknown error occured");
    return res.redirect("/updatePassword");
  }
};

// Forgot password flow
module.exports.verifyEmailForForgetPassPage = (req, res) => {
  return res.render("./pages/auth/forgotPassword/verifyEmailForForgetPass");
};

module.exports.verifyEmailForForgetPass = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  tempUser = user;

  if (user) {
    const otp = crypto.randomInt(100000, 999999).toString();
    req.session.otp = otp;
    console.log("Forgot password OTP:", otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hello, your OTP is: ${otp}`,
    });

    req.flash("success", "Email verified successfully!");
    return res.render("./pages/auth/forgotPassword/forgotPasswordOTP");
  } else {
    req.flash("error", "Email not found");
    return res.redirect("/forgot-password");
  }
};

module.exports.forgotPasswordOTP = (req, res) => {
  const { otp } = req.body;
  if (otp == req.session.otp) {
    return res.render("./pages/auth/forgotPassword/forgotPassword");
  } else {
    req.flash("error", "Invalid OTP");
    return res.redirect("/verifyEmailForForgetPass");
  }
};

module.exports.forgotPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  try {
    if (newPassword === confirmPassword) {
      const user = await User.findById(tempUser._id);
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      tempUser = {};
      req.flash("success", "Password reset successfully!");
      return res.redirect("/login");
    } else {
      req.flash("error", "Passwords don’t match");
      return res.redirect("/forgotPassword");
    }
  } catch (error) {
    console.log(error.message);
    return res.redirect("/verifyEmailForForgetPass");
  }
};
