const express = require("express");
const router = express.Router();
const { admin, db } = require('../lib/firebase');
const path = require('path');

// Ruta principal
router.get('/', async (req, res) => {
  res.render('download', {       
  });

});

router.get('/causas-cierre-hfc', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/buscador_Causas_HFC.html'));

});


module.exports = router;