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
    user: 'Carlos',
  });

});

router.get('/admin', isLoggedIn, async (req, res) => {
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

router.post('/admin', isLoggedIn, async (req, res) => {
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

// Listar todos los servicios
router.get('/services', async (req, res) => {
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
router.post('/services', async (req, res) => {
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
router.put('/services', async (req, res) => {
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
router.delete('/services', async (req, res) => {
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