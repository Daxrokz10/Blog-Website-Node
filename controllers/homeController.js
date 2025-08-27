const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

module.exports.homePage = (req, res) => {
    if(req.session && req.session.userId){
        console.log('Session active');
        return res.render('index');
    }else{
        return res.redirect('/login');
    }
}
module.exports.login = (req, res) => {
    return res.render('./pages/login');
}
module.exports.loginHandle = async (req, res) => {
    const { username, password } = req.body;
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
    return res.render('./pages/signup')
}
module.exports.signupHandle = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.redirect('/?signupError=1');
        } else {
            const hashed = await bcrypt.hash(password, 10);
            const newUser = await User.create({ username, email, password: hashed });
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