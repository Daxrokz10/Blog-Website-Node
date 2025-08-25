const express = require('express');
const homeRouter = express.Router();
const homeController = require('../controllers/homeController');

homeRouter.get('/',homeController.homePage);
homeRouter.get('/login',homeController.login);
homeRouter.post('/login',homeController.loginHandle);
homeRouter.get('/signup',homeController.signup);
homeRouter.post('/signup',homeController.signupHandle);

module.exports = homeRouter;