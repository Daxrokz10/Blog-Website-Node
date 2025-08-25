const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

module.exports.homePage = (req,res)=>{
    return res.render('index');
}
module.exports.login = (req,res)=>{
    return res.render('./pages/login');
}
module.exports.loginHandle = (req,res)=>{
    return res.render('./pages/login');
}
module.exports.signupHandle = (req,res)=>{
    return res.render('./pages/signup');
}

