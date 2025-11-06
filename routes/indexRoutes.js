const express = require("express");
const router = express.Router();
const { admin, db } = require('../lib/firebase');

// Ruta principal
router.get('/', async (req, res) => {
  res.render('download', {       
  });

});


module.exports = router;