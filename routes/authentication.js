const express = require('express');
const router = express.Router();

const passport = require('passport');
const { isLoggedIn, isNotLoggedIn, isNotLoggedInApi  } = require('../lib/auth');

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
  
  router.post('/api/signin', (req, res, next) => {
    try{
      passport.authenticate('remote.signin', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: info?.message || 'Credenciales incorrectas' });

        // Iniciar sesión manualmente
        req.logIn(user, (err) => {
          if (err) return next(err);
          // console.log('Usuario autenticado:', user);   
          // console.log('ID:', user.id);                 

          return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            userId: user.id
          });
        });
      })(req, res, next);
    }catch(e){
      return res.status(500).json({ message: e.err });
    }
  });


  module.exports = router;