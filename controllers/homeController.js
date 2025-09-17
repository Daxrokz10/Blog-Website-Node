const User = require("../models/userSchema");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");

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
  }
};

module.exports.sureDeleteUser = (req, res) => {
  return res.render("./pages/auth/sureDeleteUser");
};

module.exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (valid) {
      await User.findByIdAndDelete(req.user._id);
      res.redirect("/login");
    } else {
      req.flash("error", "Password incorrect");
      res.redirect("/profile");
    }
  } catch (error) {
    console.log("Error Deleting User:", error);
    res.redirect("/profile");
  }
};
