const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const Post = require('../models/Post')

module.exports.defaultRoute = (req,res)=>{
    if(req.session && req.session.userId){
        console.log('Session active');
        if(req.session.role == "admin"){
            return res.redirect('/admin');
        }else{
            return res.redirect('/blog');
        }
    }else{
        return res.redirect('/login');
    }
}

module.exports.homePageAdmin = (req, res) => {
    if(req.session && req.session.userId){
        console.log('Session active');
        if(req.session.role == "admin"){
            return res.render('index');
        }else{
            return res.redirect('/blog');
        }
    }else{
        return res.redirect('/login');
    }
}

module.exports.homePageReader = async (req, res) => {
  if (!req.session?.userId) return res.redirect('/login');
  // allow both roles to see feed
  const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
  return res.render('./pages/blog/blogHome', { posts });
};

module.exports.homePageWriter = async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.redirect('/login');
    }

    const posts = await Post.find({ author: req.session.userId }).sort({ createdAt: -1 });

    res.render("pages/writer/writerHome", {
      user: req.session,
      posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports.login = (req, res) => {
    return res.render('./pages/auth/login');
}
module.exports.loginHandle = async (req, res) => {
    const { username, password, role } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.username = user.username;
        req.session.role = user.role;
        if(user.role == "admin"){
            return res.redirect('/admin');
        }else{
            return res.redirect('/blog');
        }
    } else {
        return res.redirect('/?loginError=1');
    }
}
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

module.exports.logout = (req,res)=>{
    req.session.destroy(()=>{
        return res.redirect('/login');
    })
}

module.exports.profilePage = async (req, res) => {
  if (!req.session?.userId) return res.redirect('/login');
  const posts = await Post.find({ author: req.session.userId }).sort({ createdAt: -1 });
  res.render('./pages/writer/profile', { posts, user: req.session });
};