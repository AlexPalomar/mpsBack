const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

const helpers = require('../lib/helpers');

router.get('/signup', isNotLoggedIn, (req,res) => {
    res.render('auth/signup');
});


router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
        successRedirect: '/profile',
        failureRedirect: '/signup',
        failureFlash: true
    }));

router.get('/signin', isNotLoggedIn, async (req,res) => {
    // const pass = await helpers.encryptPassword('111');
    // console.log(pass);
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req,res, next) => {

    passport.authenticate('local.signin', {
        successRedirect: '/',
        failureRedirect: '/admin',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, (req,res) => {
    res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/signin');
});

module.exports = router;