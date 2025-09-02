const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const passport = require('passport');

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

  return res.render("./pages/blog/blogHome", { posts });
};

module.exports.homePageWriter = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });

  res.render("pages/writer/writerHome", {
    user: req.user,
    posts,
  });
};

module.exports.login = (req, res) => {
    return res.render('./pages/auth/login');
}
module.exports.loginHandle = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login?error=1');

    req.logIn(user, (err) => {
      if (err) return next(err);
      if (user.role === "admin") {
        return res.redirect('/admin');
      } else {
        return res.redirect('/blog');
      }
    });
  })(req, res, next);
};
module.exports.signup = (req, res) => {
    return res.render('./pages/auth/signup')
}
module.exports.signupHandle = async (req, res) => {
    const { username, email, password ,role} = req.body;
    try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.redirect('/?signupError=1');
        } else {
            const hashed = await bcrypt.hash(password, 10);
            const newUser = await User.create({ username, email, password: hashed ,role});
            console.log("New User Created", newUser);

        }

        return res.redirect('/login');
    } catch (error) {
        console.log(error.message);
        return res.redirect('/signup');
    }
}

module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/login');
  });
};

module.exports.profilePage = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
  res.render('./pages/writer/profile', { posts, user: req.user });
};