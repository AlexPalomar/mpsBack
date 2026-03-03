const express = require("express");
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const { cierreCicloService, } = require('../container');

// Ruta principal
router.get('/', async (req, res) => {
  const cicloService = await cierreCicloService.getCierreCiclo();
  console.log(cicloService.docs);
  res.render('download', {       
  });

});


module.exports = router;