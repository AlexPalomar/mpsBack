const express = require("express");
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { cierreCicloService, } = require('../container');
const path = require('path');

// Ruta principal
router.get('/', async (req, res) => {
  const cicloService = await cierreCicloService.getCierreCiclo();
  console.log(cicloService.docs);
  res.render('download', {       
  });

});

router.get('/causas-cierre-hfc', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/buscador_Causas_HFC.html'));

});


module.exports = router;