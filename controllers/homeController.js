const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const passport = require("passport");
require('dotenv').config();
const flash = require('connect-flash');
const nodemailer = require("nodemailer");


module.exports.defaultRoute = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === "admin") {
      return res.redirect("/admin");
    } else {
      return res.redirect("/blog");
    }
  } else {
    return res.redirect("/login");
  }
};

module.exports.homePageAdmin = (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return res.render("index");
  } else {
    return res.redirect("/login");
  }
};

module.exports.homePageReader = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  const posts = await Post.find()
    .populate("author", "username")
    .sort({ createdAt: -1 });

  return res.render("./pages/blog/blogHome", { posts, user: req.user });
};

module.exports.homePageWriter = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  const posts = await Post.find({ author: req.user._id }).sort({
    createdAt: -1,
  });

  res.render("pages/writer/writerHome", {
    user: req.user,
    posts,
  });
};

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
        req.flash('success','Welcome back user!')
        return res.redirect("/blog");
      }
    });
  })(req, res, next);
};
module.exports.signup = (req, res) => {
  return res.render("./pages/auth/signup");
};
module.exports.signupHandle = async (req, res) => {
  const { username, email, password, role } = req.body;
  const userData = { username, email, password, role }; 
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.redirect("/?signupError=1");
    } 

    req.session.userData = { username, email, password, role };
    // else {
      // const hashed = await bcrypt.hash(password, 10);
      // const newUser = await User.create({
      //   username,
      //   email,
      //   password: hashed,
      //   role,
      // });
      // req.flash('success','Welcome new user!')
    // }

    return res.render("./pages/auth/sendOTP",{userData});
  } catch (error) {
    console.log(error.message);
    return res.redirect("/signup");
  }
};

module.exports.sendOTP = async (req, res) => {
  try {
    // Only allow OTP if session has userData
    if (!req.session.userData) {
      req.flash("error", "No signup data found. Please signup again.");
      return res.redirect("/signup");
    }

    const { username, email } = req.session.userData;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    req.session.otp = otp;

    // Nodemailer config
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hello ${username}, your OTP is: ${otp}`,
    });

    console.log("✅ OTP Sent:", otp);

    return res.render("./pages/auth/verifyOTP");
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    req.flash("error", "Could not send OTP. Try again.");
    return res.redirect("/signup");
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp)
    if (parseInt(otp) === req.session.otp) {
      // hash password and create user
      const hashed = await bcrypt.hash(req.session.userData.password, 10);

      await User.create({
        username: req.session.userData.username,
        email: req.session.userData.email,
        password: hashed,
        role: req.session.userData.role,
      });

      // clear session
      req.session.otp = null;
      req.session.userData = null;

      req.flash("success", "Signup successful! Please login.");
      return res.redirect("/login");
    } else {
      req.flash("error", "Invalid OTP, try again.");
      return res.redirect("/errorpage");
    }
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
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

module.exports.profilePage = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  const posts = await Post.find({ author: req.user._id }).sort({
    createdAt: -1,
  });
  res.render("./pages/writer/profile", { posts, user: req.user });
};

module.exports.editBio = (req, res) => {
  return res.render("./pages/writer/editBio", { user: req.user });
};

module.exports.editBioHandle = async (req, res) => {
  try {
    let {
      profilePicture,
      experienceLevel,
      favoriteArtists,
      software,
      favoriteGenre,
      preferredMood,
      city,
      availability,
      badges,
      tags,
      bio,
    } = req.body;

    let userBioDetails = {
      profilePicture,
      experienceLevel,
      favoriteArtists,
      software,
      favoriteGenre,
      preferredMood,
      city,
      availability,
      badges,
      tags,
      bio,
    };

    if (req.file) {
      userBioDetails.profilePicture = req.file.path;
    }

    await User.findByIdAndUpdate(req.user._id, userBioDetails, { new: true });
    res.redirect("/profile");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating profile");
    return res.redirect("/profile");
  }
};

module.exports.sureDeleteUser = (req, res) => {
  return res.render("./pages/auth/sureDeleteUser");
};

module.exports.deleteUser = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    let valid = await bcrypt.compare(req.body.password, user.password);
    if (valid) {
      let deletedUser = await User.findByIdAndDelete(req.user._id);
      res.redirect("/login");
    } else {
      console.log("Error Deleting User here");
      res.redirect("/profile");
    }
  } catch (error) {
    console.log("Error Deleting User");
    res.redirect("/profile");
  }
};

module.exports.updatePassword = (req, res) => {
  try {
    return res.render("./pages/auth/updatePassword");
  } catch (error) {
    console.log(error);
    return res.redirect("/profile");
  }
};

module.exports.updatePasswordHandle = async (req, res) => {
  try {
    let { oldPassword, newPassword, confirmPassword } = req.body;
    let user = await User.findById(req.user._id);
    let isValid = await bcrypt.compare(oldPassword, user.password);

    if (isValid) {
      if (newPassword == confirmPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        req.flash('success','Password updated successfully')
        return res.redirect("/logout");
      } else {
        req.flash('error',"New password and confirm password dont match");
        return res.redirect('/updatePassword');
      }
    } else {
      req.flash('error',"Current Password is incorrect");

      return res.redirect('/updatePassword');
    }
  } catch (error) {
    console.log(error);
    req.flash('error',"Unknown error occured");

    return res.redirect('/updatePassword');
  }
};

