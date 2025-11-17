const express = require('express');
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const helper = require('../lib/helpers');
const moment = require('moment');

const now = moment();
const timestampFormateado = now.format('YYYY-MM-DD HH:mm:ss');

router.get('/adminUsers', isLoggedIn, async (req, res) => {
  try {
    const snapshot = await db.collection('user').get();
    const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.render('adminUsers', {
      title: 'Administración de Usuarios',
      user: user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los servicios');
  }
});

router.post('/adminUsers', isLoggedIn, async (req, res) => {
  try {
    const filter = req.body
    if(filter.filter == null || filter.search == ''){

      const snapshot = await db.collection('user').get();
      const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.render('adminUsers', {
        title: 'Administración de Usuarios',
         user: user,
      });
    } else {
      if(filter.filter != 'identification'){

        // const snapshot = await db.collection('user').where(filter.filter, '==', filter.search).get();
        // const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const snapshot = await db.collection('user').get();
        let user;

        switch(filter.filter){
          case 'name':
            user = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.name.toUpperCase().includes(filter.search.toUpperCase()));
          break;
          case 'role':
            user = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.role.toUpperCase().includes(filter.search.toUpperCase()));
          break;
          case 'status':
            user = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.status.toUpperCase().includes(filter.search.toUpperCase()));
          break;
        }

        res.render('adminUsers', {
          title: 'Administración de Usuarios',
           user: user,
        });
      }else{
        const convertAtNumber = parseInt(filter.search);
        const snapshot = await db.collection('user').where(filter.filter, '==', convertAtNumber).get();
        const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.render('adminUsers', {
          title: 'Administración de Usuarios',
           user: user,
        });
      }

    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los servicios');
  }
});

router.post('/create_User', isLoggedIn, async (req, res) => {
  try {

    if (req.body.password !== req.body.confirmPassword) {
      const snapshot = await db.collection('user').get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.render('adminUsers', {
        title: 'Administración de Usuarios',
        user: users,
        message: 'Las contraseñas no coinciden.'
      });
    }

    // Buscar email en Firestore
    const snapshot = await db.collection('user')
      .where('email', '==', req.body.email.toLowerCase())
      .get();

    const usersFound = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Si no existe → crearlo
    if (usersFound.length === 0) {

      const passEncripted = await helper.encryptPassword(req.body.password);

      const newUser = {
        identification: parseInt(req.body.identification),
        name: req.body.name.toUpperCase(),
        role: req.body.role.toUpperCase(),
        email: req.body.email.toLowerCase(),
        password: passEncripted,
        status: 'ACTIVO',
        createdAt: timestampFormateado,
        modifiedAt: timestampFormateado
      };

      await db.collection('user').add(newUser);

      const snapshotAll = await db.collection('user').get();
      const users = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return res.render('adminUsers', {
        title: 'Administración de Usuarios',
        user: users,
        success: 'Usuario creado correctamente.'
      });
    }

    // Si existe → mostrar error
    const emailFound = usersFound[0].email;

    const snapshotAll = await db.collection('user').get();
    const users = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.render('adminUsers', {
      title: 'Administración de Usuarios',
      user: users,
      message: `El correo ${emailFound} ya está registrado.`
    });

  } catch (err) {
    console.error(err);
    const snapshot = await db.collection('user').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.render('adminUsers', {
      title: 'Administración de Usuarios',
      user: users,
      message: err.message
    });
  }
});


router.post('/edit_user', isLoggedIn, async (req, res) =>{
  try {
    const {identification, ...data} = req.body;

    const snapshot = await db.collection('user').where('identification', '==', parseInt(identification)).get();
    const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    user[0].identification = parseInt(req.body.identification),
    user[0].name = req.body.name.toUpperCase(),
    user[0].role = req.body.role.toUpperCase(),
    user[0]. email = req.body.email.toLowerCase(),
    user[0].status = req.body.status.toUpperCase(),
    user[0].modifiedAt = timestampFormateado
    await db.collection('user').doc(user[0].id).update(user[0]);

  } catch (err) {
    console.error('Error: ', err);
  }

  const snapshot = await db.collection('user').get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.render('adminUsers', {
    title: 'Administración de Usuarios',
    user: users,
    success: 'Usuario modificado correctamente.'
  });
});


module.exports = router;