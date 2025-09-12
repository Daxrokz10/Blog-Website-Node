const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const passport = require("passport");
const flash = require('connect-flash');

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
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.redirect("/?signupError=1");
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        email,
        password: hashed,
        role,
      });
      req.flash('success','Welcome new user!')
      console.log(req.flash('success'));
      console.log("New User Created", newUser);
    }

    return res.redirect("/login");
  } catch (error) {
    console.log(error.message);
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
