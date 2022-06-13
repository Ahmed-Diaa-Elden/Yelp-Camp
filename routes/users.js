const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isLoggedOut} = require('../middleware');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register))

router.route('/login')
    .get(isLoggedOut, users.renderLogin)
    .post(isLoggedOut, passport.authenticate('local', { failureFlash:true , failureRedirect: ('/login') } ), catchAsync(users.login))

router.get('/logout',isLoggedIn, users.logout)

module.exports = router;

// accounts linked are
// dog --> dog /  Diaa --> monkey