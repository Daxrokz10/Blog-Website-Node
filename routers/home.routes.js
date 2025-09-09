const express = require('express');
const homeRouter = express.Router();
const homeController = require('../controllers/homeController');
const { isAuth, allowUsers } = require('../middlewares/auth');


homeRouter.get('/',homeController.defaultRoute);

homeRouter.get('/admin',homeController.homePageAdmin);
homeRouter.get('/blog',homeController.homePageReader);
homeRouter.get('/write',homeController.homePageWriter);


homeRouter.get('/login',homeController.login);
homeRouter.post('/login',homeController.loginHandle);

homeRouter.get('/signup',homeController.signup);
homeRouter.post('/signup',homeController.signupHandle);

homeRouter.get('/logout',homeController.logout);

homeRouter.get('/profile', homeController.profilePage);

//edit bio
homeRouter.get("/editBio",isAuth,homeController.editBio)

module.exports = homeRouter;