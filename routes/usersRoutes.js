const express = require('express');
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');



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

router.post('/newUser', isLoggedIn, async (req, res) => {
  try {
    const newUser = req.body;
    const docRef = await db.collection('user').add(newUser);
    res.json({ Result: 'OK', Record: { id: docRef.id, ...newUser } });
  } catch (err) {
    console.error(err);
    res.json({ Result: 'ERROR', Message: err.message });
  }
});

router.post('/edit-user', isLoggedIn, async (req, res) =>{
  // ALEXANDER	DRIVER	alexnovoa1999@gmail.com
  try {
    const {identification, ...data} = req.body;

    const snapshot = await db.collection('user').where('identification', '==', identification).get();
    // const user = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // await db.collection('user').doc(user.id).update(data);
    console.log(req.body);
    console.log(snapshot.doc);
    // res.json({ Result: 'OK' });
  } catch (err) {
    console.error(err);
    // res.json({ Result: 'ERROR', Message: err.message });
  }
  
  res.redirect('/adminUsers');
});


module.exports = router;