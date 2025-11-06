const express = require('express');
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');


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

router.get('/0254ToUppercaseRegServices', isLoggedIn, async (req,res) =>{
  const snapshot = await db.collection('escalera').get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    const tecnico = data.tecnico ? data.tecnico.toUpperCase() : '';
    const addres = data.addres ? data.addres.toUpperCase() : '';
    const supportZone = data.supportZone ? data.supportZone.toUpperCase() : '';
    const driver = data.driver ? data.driver.toUpperCase() : '';
    const ladder = data.ladder ? data.ladder.toUpperCase() : '';
    const durationTimeout = data.durationTimeout ? data.durationTimeout.toUpperCase() : '';
    const executeTimeout = data.executeTimeout ? data.executeTimeout.toUpperCase() : '';
    const status = data.status ? data.status.toUpperCase() : '';

    const ref = db.collection('escalera').doc(doc.id);
    batch.update(ref, { tecnico: tecnico, addres: addres, supportZone: supportZone, driver: driver, ladder: ladder, durationTimeout: durationTimeout, executeTimeout: executeTimeout, status: status});
    // console.log(data);
    // console.log({ tecnico: tecnico, addres: addres, supportZone: supportZone, driver: driver, ladder: ladder, durationTimeout: durationTimeout, executeTimeout: executeTimeout, status: status});
    // console.log('formateado' + newName);
  });
  await batch.commit();
  console.log('✅ Todos los nombres fueron actualizados a mayúsculas');
  res.status(200);
  res.redirect('/adminServices');
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

      const snapshot = await db.collection('escalera').get();
      let data;

      switch(filter.filter){
        case 'idService':
          data = snapshot.docs
            .map(doc => doc.data())
            .filter(s => s.idService.toUpperCase().includes(filter.search.toUpperCase()));
        break;
        case 'status':
          data = snapshot.docs
            .map(doc => doc.data())
            .filter(u => u.status.toUpperCase().includes(filter.search.toUpperCase()));
        break;
        case 'tecnico':
          data = snapshot.docs
            .map(doc => doc.data())
            .filter(u => u.tecnico.toUpperCase().includes(filter.search.toUpperCase()));
        break;
        case 'driver':
          data = snapshot.docs
            .map(doc => doc.data())
            .filter(u => u.driver.toUpperCase().includes(filter.search.toUpperCase()));
        break;
      }

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

// Crear nuevo servicio
router.post('/disable', isLoggedIn, async (req, res) => {
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
router.put('/disable', isLoggedIn, async (req, res) => {
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
// router.delete('/disable', isLoggedIn, async (req, res) => {
//   try {
//     const { id } = req.body;
//     await db.collection('escalera').doc(id).delete();
//     res.json({ Result: 'OK' });
//   } catch (err) {
//     console.error(err);
//     res.json({ Result: 'ERROR', Message: err.message });
//   }
// });


module.exports = router;