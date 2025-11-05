const express = require("express");
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

// Ruta principal
router.get('/', async (req, res) => {
  const snapshot = await db.collection('escalera').get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.render('download', {              
    title: 'Página de Inicio',
  });

});

router.get('/adminServices', isLoggedIn, async (req, res) => {
  try {
    const snapshot = await db.collection('escalera').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.render('adminServices', {              
      title: 'Servicios Escalera',
      data: data,
    });

    // console.log(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los servicios');
  }
});

router.post('/adminServices', isLoggedIn, async (req, res) => {
  try {
    const filter = req.body
    if(filter.filter == null || filter.search == ''){

      const snapshot = await db.collection('escalera').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.render('adminServices', {              
        title: 'Servicios Escalera',
        data: data,
      });
    } else {
      const snapshot = await db.collection('escalera').where(filter.filter, '==', filter.search).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      res.render('adminServices', {              
        title: 'Servicios Escalera',
        data: data,
      });

    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los servicios');
  }
});

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
      console.log(filter.filter);
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

// Listar todos los servicios
router.get('/disable', async (req, res) => {
  try {
    const snapshot = await db.collection('escalera').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ Result: 'OK', Records: data });
  } catch (err) {
    console.error(err);
    res.json({ Result: 'ERROR', Message: err.message });
  }
});

// Crear nuevo servicio
router.post('/disable', async (req, res) => {
  try {
    const newService = req.body;
    const docRef = await db.collection('escalera').add(newService);
    res.json({ Result: 'OK', Record: { id: docRef.id, ...newService } });
  } catch (err) {
    console.error(err);
    res.json({ Result: 'ERROR', Message: err.message });
  }
});

// Editar servicio existente
router.put('/disable', async (req, res) => {
  try {
    const { id, ...data } = req.body;
    await db.collection('escalera').doc(id).update(data);
    res.json({ Result: 'OK' });
  } catch (err) {
    console.error(err);
    res.json({ Result: 'ERROR', Message: err.message });
  }
});

// Eliminar servicio
router.delete('/disable', async (req, res) => {
  try {
    const { id } = req.body;
    await db.collection('escalera').doc(id).delete();
    res.json({ Result: 'OK' });
  } catch (err) {
    console.error(err);
    res.json({ Result: 'ERROR', Message: err.message });
  }
});

module.exports = router;