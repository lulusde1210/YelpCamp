const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');


router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.createUser));

router.route('/login')
    .get(users.renderLogInForm)
    .post(passport.authenticate('local', {//passport.authenticate() method invoke req.login() automatically
        failureFlash: true,
        failureRedirect: '/login',
        keepSessionInfo: true, // this line is to keep the session info, not shown in colt's codes
    }),
        users.logIn);

router.get('/logout', users.logOut);

module.exports = router;



// router.get('/register', users.renderRegisterForm);

// router.post('/register', catchAsync(users.createUser));

// router.get('/login', users.renderLogInForm)

// router.post('/login', passport.authenticate('local', {//passport.authenticate() method invoke req.login() automatically
//     failureFlash: true,
//     failureRedirect: '/login',
//     keepSessionInfo: true, // this line is to keep the session info, not shown in colt's codes
// }),
//     users.logIn)

// router.get('/logout', users.logOut);
// 