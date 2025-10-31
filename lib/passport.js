const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const admin = require('firebase-admin');
const db = admin.firestore();

const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    console.log(username);

    try {
    console.log('Intentando login de:', username);

    const snapshot = await db.collection('users').where('username', '==', username).get();

    if (snapshot.empty) {
      return done(null, false, req.flash('message', 'El usuario no existe'));
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    user.id = userDoc.id; // Guardamos el ID del documento

    const validPassword = await helpers.matchPassword(password, user.password);

    if (validPassword) {
      return done(null, user, req.flash('success', 'Bienvenido ' + user.username));
    } else {
      return done(null, false, req.flash('message', 'Contraseña incorrecta'));
    }

  } catch (error) {
    console.error('Error en login:', error);
    return done(error);
  }

}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {

    try {
    const { fullname } = req.body;

    // Encriptamos la contraseña
    const encryptedPassword = await helpers.encryptPassword(password);

    const newUser = {
      username,
      password: encryptedPassword,
      fullname,
      createdAt: new Date()
    };

    // Guardamos el usuario en Firestore
    const docRef = await db.collection('users').add(newUser);
    newUser.id = docRef.id;

    console.log('Usuario creado en Firebase:', newUser.username);
    return done(null, newUser);

  } catch (error) {
    console.error('Error en registro:', error);
    return done(error);
  }

}));

// console.log(passport);
passport.serializeUser((user,done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userDoc = await db.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return done(null, false);
    }

    const user = userDoc.data();
    user.id = id;
    done(null, user);

  } catch (error) {
    console.error('Error al deserializar usuario:', error);
    done(error, null);
  }
});