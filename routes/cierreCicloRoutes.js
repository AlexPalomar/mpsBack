const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers');
const { admin, db } = require('../lib/firebase');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');
const { cierreCicloService } = require('../container');


router.get('/cierreCiclo', isLoggedIn, async(req, res) => {
  try {
    const cierreCiclo = await cierreCicloService.getCierreCiclo();
    const causa = await cierreCicloService.getCausaCierreCiclo();
    const roles = await cierreCicloService.getRolesCierreCiclo();
    const supervisor = roles[0];
    const tecnicos = roles[1];
    
    res.status(200).render('cierreCiclo', {              
      title: 'Cierre de Ciclo',
      supervisor: supervisor,
      tecnico: tecnicos,
      data: cierreCiclo,
      causa: causa,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los registros');
  }
});

router.post('/cierreCiclo', isLoggedIn, async (req, res) => {
  try {
    const filter = req.body

    const causa = await cierreCicloService.getCausaCierreCiclo();
    const roles = await cierreCicloService.getRolesCierreCiclo();
    const supervisor = roles[0];
    const tecnicos = roles[1];

    if(filter.filter == null || filter.search == ''){

      const cierreCiclo = await cierreCicloService.getCierreCiclo();

      res.render('cierreCiclo', {              
        title: 'Cierre de Ciclo',
        supervisor: supervisor,
        tecnico: tecnicos,
        data: cierreCiclo,
        causa: causa,
      });
    } else {
      if(filter.filter != 'idCCiclo'){

        const snapshotFilter = await cierreCicloService.getFilterCierreCiclo(filter.filter,filter.search);
        res.render('cierreCiclo', {              
          title: 'Cierre de Ciclo',
          supervisor: supervisor,
          tecnico: tecnicos,
          data: snapshotFilter,
          causa: causa,
        });
      }else{
        const cierreCiclo = await cierreCicloService.getByIdiccCierreCiclo(filter.search);

        res.render('cierreCiclo', {              
          title: 'Cierre de Ciclo',
          supervisor: supervisor,
          tecnico: tecnicos,
          data: cierreCiclo,
          causa: causa,
        });
      }
    }
  }finally{

  }
});

router.post('/cierreCiclo', isLoggedIn, async (req, res) => {
  try {
    const filter = req.body

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

    if(filter.filter == null || filter.search == ''){

      const snapshot = await db.collection('cierreCiclo').get();
      const cierreCiclo = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.render('cierreCiclo', {              
        title: 'Cierre de Ciclo',
        supervisor: supervisor,
        tecnico: tecnicos,
        data: cierreCiclo,
        causa: causa,
      });
    } else {
      if(filter.filter != 'idCCiclo'){

        const snapshot = await db.collection('cierreCiclo').get();
        let cierreCiclo;

        switch(filter.filter){
          case 'tecnico':
            cierreCiclo = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.tecnico.toUpperCase().includes(filter.search.toUpperCase()));
          break;
          case 'superviser':
            cierreCiclo = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.superviser.toUpperCase().includes(filter.search.toUpperCase()));
          break;
          case 'status':
            cierreCiclo = snapshot.docs
              .map(doc => doc.data())
              .filter(u => u.status.toUpperCase().includes(filter.search.toUpperCase()));
          break;
        }

        res.render('cierreCiclo', {              
          title: 'Cierre de Ciclo',
          supervisor: supervisor,
          tecnico: tecnicos,
          data: cierreCiclo,
          causa: causa,
        });
      }else{
        const snapshot = await db.collection('cierreCiclo').where(filter.filter, '==', filter.search).get();
        const cierreCiclo = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.render('cierreCiclo', {              
          title: 'Cierre de Ciclo',
          supervisor: supervisor,
          tecnico: tecnicos,
          data: cierreCiclo,
          causa: causa,
        });
      }
    }
  } catch (err) {
    req.flash('message', err);
    console.error(err);
    res.redirect('/cierreCiclo');
  }
});


router.post('/create_cierreCiclo', isLoggedIn, async (req, res) => {
  try{
    var reqBody = req.body;
    if (!reqBody) {
      req.flash('message', 'No se pudo guardar el registro.');
      return res.redirect('/cierreCiclo');
    }
    
    reqBody.user = req.user.name;
    await cierreCicloService.createCierreCiclo(reqBody);

    req.flash('success', 'Guardado exitosamente.');
    return res.redirect('/cierreCiclo');
  } catch (err) {
    console.error(err);
    req.flash('message', err.message);
    return await res.redirect('/cierreCiclo');
  }
});

router.post('/cierreCiclo/update', isLoggedIn, async (req, res) => {
  try {
    const id = req.body.editCcidCCiclo;
    const body = req.body;
    body['user'] = req.user.name;
    if (!id) {
      throw new Error('ID del registro es requerido');
    }
    const result = await cierreCicloService.updateCierreCiclo(body);

    if (result.hasChanges == false) {
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
      esteticaFuncionamiento: req.body.editCalificacionEyF, 
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
    req.flash('message', err.toString());
    return res.redirect('/cierreCiclo');
  }
});

router.post('/import-cierre-ciclo', isLoggedIn, async (req, res) => {
  try {

    const excelData = req.body;

    if (!Array.isArray(excelData) || excelData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos'
      });
    }

    const result = await cierreCicloService
      .createMasiveCierreCiclo(excelData, req.user);

    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

router.post('/import-cierre-ciclo', isLoggedIn, async (req, res) => {
  try {
    const excelData = req.body; // array desde el frontend
    if (!Array.isArray(excelData) || excelData.length === 0) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    //Obtener orders existentes
    const snapshot = await db.collection('cierreCiclo').get();
    const ordersExistentes = new Set();

    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.order) ordersExistentes.add(d.order);
    });
    
    // Filtrar registros nuevos
    var count = 0;
    const nuevos = excelData.filter(row => {
      return row['Orden de trabajo'] && !ordersExistentes.has(row['Orden de trabajo']);
    });

    // Guardar solo los nuevos
    const batch = db.batch();

    nuevos.forEach(row => {
      const ref = db.collection('cierreCiclo').doc();

      const pyc = Number(row['Como califica la presentación personal, comportamiento y aptitud de los técnicos?']);
      const eyf = Number(row['Los servicios instalados cumplen con su necesidad en cuanto a estética y funcionamiento?']);
      const rs  = Number(row['Recomendaría usted los servicios de Claro?']);

      const promedioNps = Number(((pyc + eyf + rs) / 3).toFixed(2));

      batch.set(ref, {
        idCCiclo: helpers.generateCodeCC(),
        cliente: row.Nombre || '',
        order: row['Orden de trabajo'], // CLAVE ÚNICA
        phoneNumber: row['Telefono dos del cliente'] + ' - ' + row['Teléfono uno del contacto'] || '0',
        address: row['Dirección campo 1'] || '',
        tecnico: row['Técnico'] || '',
        superviser: row['supervisor'] || '',
        observation: row['observaciones'] || '',
        presentacionComportamiento: pyc || 0,
        esteticaFuncionamiento: eyf || 0,
        recomendacionServicio: rs || 0,
        causaCierreCiclo: '',
        estadoGestionCC: '',
        promedioNps: Number(promedioNps) || null,
        createdBy: req.user.name.toUpperCase() || '',
        createdAt: new Date(),
        status: 'PENDIENTE',
        modifiedAt: new Date(),
        notesClousure: '',
      });
    });

    await batch.commit();

    if(batch._ops.length == 0){
      res.json({success: false, error: 'No se insertaron registros, todos los registros del excel ya existen en la base de datos.'});
    }else{
      
      res.json({
        success: true,
        totalExcel: excelData.length,
        insertados: nuevos.length,
        duplicados: excelData.length - nuevos.length
      });
    }
    

  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
});



module.exports = router;