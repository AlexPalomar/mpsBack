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
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, (req,res) => {
    res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    // destruye la sesión del servidor (opcional pero recomendado)
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // limpia la cookie de sesión
      res.redirect('/signin');
    });
  });
});

module.exports = router;