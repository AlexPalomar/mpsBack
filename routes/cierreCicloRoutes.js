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



module.exports = router;