const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');


router.get('/cierreCiclo', isLoggedIn, async(req, res) => {
  try {
      const snapshotCierreCiclo = await db.collection('cierreCiclo').get();
      const cierreCiclo = snapshotCierreCiclo.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const snapshotCausaCierreCiclo = await db.collection('causaCierreCiclo').get();
      const causa = snapshotCausaCierreCiclo.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const snapshotUsers = await db
        .collection('user')
        .where('role', 'in', ['ADMIN', 'TECNICO'])
        .get();

      const users = snapshotUsers.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const supervisor = users.filter(u => u.role === 'ADMIN');
      const tecnicos = users.filter(u => u.role === 'TECNICO');

      res.render('cierreCiclo', {              
        title: 'Cierre de Ciclo',
        supervisor: supervisor,
        tecnico: tecnicos,
        data: cierreCiclo,
        causa: causa,
      });
  
      // console.log(data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al obtener los registros');
    }

});

router.post('/cierreCiclo', isLoggedIn, async (req, res) => {
  try {
    const { filter, search } = req.query;

      // OBTENER CIERRE DE CICLO
    let snapshotCierreCiclo;

    if (!filter || filter === 'null' || !search) {
      // Sin filtros
      snapshotCierreCiclo = await db.collection('cierreCiclo').get();
    } else {

      // Filtros exactos (Firestore where)
      if (['status', 'tecnico', 'superviser', 'idCCiclo'].includes(filter)) {
        snapshotCierreCiclo = await db
          .collection('cierreCiclo')
          .where(filter, '==', search.toUpperCase())
          .get();
      } else {
        // Filtros por texto (includes)
        const all = await db.collection('cierreCiclo').get();
        snapshotCierreCiclo = {
          docs: all.docs.filter(doc =>
            (doc.data()[filter] || '')
              .toUpperCase()
              .includes(search.toUpperCase())
          )
        };
      }
    }

    const cierreCiclo = snapshotCierreCiclo.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

      // CAUSAS DE CIERRE
    const snapshotCausaCierreCiclo = await db
      .collection('causaCierreCiclo')
      .get();

    const causa = snapshotCausaCierreCiclo.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

      // USUARIOS (SUPERVISOR / TÉCNICO)
    const snapshotUsers = await db
      .collection('user')
      .where('role', 'in', ['ADMIN', 'TECNICO'])
      .get();

    const users = snapshotUsers.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const supervisor = users.filter(u => u.role === 'ADMIN');
    const tecnicos   = users.filter(u => u.role === 'TECNICO');
    console.log(cierreCiclo[0]);
      //RENDER
    res.render('cierreCiclo', {
      title: 'Cierre de Ciclo',
      supervisor,
      tecnico: tecnicos,
      data: cierreCiclo,
      causa,
      filter,
      search
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los registros');
  }
});


router.post('/create_cierreCiclo', isLoggedIn, async (req, res) => {
  try {

      if (req.body) {
        const pyc = Number(req.body.calificacionPyC);
        const eyf = Number(req.body.calificacionEyF);
        const rs  = Number(req.body.calificacionRS);

        const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2));
        const snapshot = await db
        .collection('cierreCiclo')
        .where('order', '==', req.body.orden)
        .limit(1)
        .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data[0] != undefined) {
          req.flash('message', 'Esta OT ya esta registrada.');
          return res.redirect('cierreCiclo');
        }else{
            const newCC = {
              idCCiclo: helpers.generateCodeCC(),
              cliente: req.body.cliente.toUpperCase(),
              order: req.body.orden,
              phoneNumber: req.body.telefono,
              address: req.body.direccion.toUpperCase(),
              tecnico: req.body.tecnico.toUpperCase(),
              superviser: req.body.superviser.toUpperCase(),
              observation: req.body.observaciones.toUpperCase(),
              createdAt: req.body.fechaCreacion.toUpperCase(),
              modifiedAt: admin.firestore.Timestamp.now(),
              status: req.body.estado.toUpperCase(), 
              presentacionComportamiento: req.body.calificacionPyC, 
              esteticaFuncionamiento:  req.body.calificacionEyF, 
              recomendacionServicio: req.body.calificacionRS, 
              promedioNps: promedioNps,
              estadoGestionCC: req.body.estadoGestionCierreCiclo,
              causaCierreCiclo: 'N/A',
              createdBy: req.user.name.toUpperCase(),
              modifiedBy: 'N/A',
              notesClousure: 'N/A',
              evidence: 'N/A'
            };
            // console.log(newCC);
            await db.collection('cierreCiclo').add(newCC);
    
          const snapshotAll = await db.collection('cierreCiclo').get();
          const data = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return res.render('cierreCiclo', {
            title: 'Cierre de Ciclo',
            data: data,
            success: 'Cierro de Ciclo creado correctamente.'
          });
          
        }
      }
  
    } catch (err) {
      console.error(err);
      const snapshot = await db.collection('cierreCiclo').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return res.render('cierreCiclo', {
        title: 'Cierre de Ciclo',
        data: data,
        message: err.message
      });
    }
});

router.post('/cierreCiclo/update', isLoggedIn, async (req, res) => {
  try {
    const id = req.body.editCcidCCiclo;
    if (!id) {
      throw new Error('ID del registro es requerido');
    }

    //Buscar el documento por idCCiclo
    const snapshot = await db
      .collection('cierreCiclo')
      .where('idCCiclo', '==', id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).send('Registro no encontrado');
    }

    const snapshotData = await db
    .collection('cierreCiclo')
    .where('order', '==', req.body.editCcorden)
    .limit(1)
    .get();
    const snapshotCurrent = snapshotData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const currentData = snapshotCurrent[0];
    // console.log(currentData);
    // Validar si NO hubo cambios
    const hasChanges =
      currentData.idCCiclo !== req.body.editCcidCCiclo.toUpperCase() ||
      currentData.cliente !== req.body.editCccliente.toUpperCase() ||
      currentData.order !== req.body.editCcorden ||
      currentData.phoneNumber !== req.body.editCctelefono ||
      currentData.address !== req.body.editCcdireccion.toUpperCase() ||
      currentData.tecnico !== req.body.editCctecnico.toUpperCase() ||
      currentData.superviser !== req.body.editCcsuperviser.toUpperCase() ||
      currentData.observation !== req.body.editCcobservaciones.toUpperCase() ||
      currentData.presentacionComportamiento !== req.body.editCalificacionPyC || 
      currentData.esteticaFuncionamiento !== req.body.editCalificacionEyF ||
      currentData.recomendacionServicio !== req.body.editCalificacionRS ||
      currentData.causaCierreCiclo !== req.body.editCcCausa ||
      currentData.estadoGestionCC !== req.body.editEstadoGestionCierreCiclo ||
      currentData.status !== req.body.editCcestado ||
      currentData.createdBy != currentData.createdBy ||
      currentData.modifiedBy !== req.user.name.toUpperCase() ||
      currentData.notesClousure !== req.body.editCcNotas.toUpperCase();
    if (!hasChanges) {
      req.flash('message', 'No hay cambios para actualizar');
      return res.redirect('/cierreCiclo');
    }


    //Obtener el ID real del documento
    const doc = snapshot.docs[0];
    const docId = doc.id;

    const pyc = Number(req.body.editCalificacionPyC);
    const eyf = Number(req.body.editCalificacionEyF);
    const rs  = Number(req.body.editCalificacionRS);

    const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2));

    const updateCC = {
      idCCiclo: req.body.editCcidCCiclo.toUpperCase(),
      cliente: req.body.editCccliente.toUpperCase(),
      order: req.body.editCcorden,
      phoneNumber: req.body.editCctelefono,
      address: req.body.editCcdireccion.toUpperCase(),
      tecnico: req.body.editCctecnico.toUpperCase(),
      superviser: req.body.editCcsuperviser.toUpperCase(),
      observation: req.body.editCcobservaciones.toUpperCase(),
      presentacionComportamiento: req.body.editCalificacionPyC, 
      esteticaFuncionamiento:  req.body.editCalificacionEyF, 
      recomendacionServicio: req.body.editCalificacionRS,
      causaCierreCiclo: req.body.editCcCausa,
      estadoGestionCC: req.body.editEstadoGestionCierreCiclo,
      promedioNps: promedioNps,
      modifiedAt: admin.firestore.Timestamp.now(),
      status: req.body.editCcestado,
      createdBy: doc.data().createdBy,
      modifiedBy: req.user.name.toUpperCase(),
      notesClousure: req.body.editCcNotas.toUpperCase(),
      evidence: null
    };

    // console.log('Actualizando:', updateCC);

    await db.collection('cierreCiclo').doc(docId).update(updateCC);

    const snapshotAll = await db.collection('cierreCiclo').get();
    const data = snapshotAll.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    req.flash('success', 'Cierre de Ciclo actualizado correctamente.');
    return res.redirect('/cierreCiclo');

  } catch (err) {
    console.error(err);

    const snapshot = await db.collection('cierreCiclo').get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.render('cierreCiclo', {
      title: 'Cierre de Ciclo',
      // data,
      message: err.message
    });
  }
});


// router.get('/:id', getUserById);
// router.post('/', createUser);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);

module.exports = router;