const express = require('express');
const router = express.Router();
const controllerCupom = require('../controllers/controllerCupom');

// /cupons
router.get('/:id/troca', controllerCupom.buscarCuponsTrocaCliente); // primeiro
router.get('/:id', controllerCupom.buscarCuponsCliente); 

module.exports = router;

