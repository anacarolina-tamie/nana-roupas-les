const express = require('express');
const router = express.Router();
const controllerFrete = require('../controllers/controllerFrete');
const { validarSessaoCliente } = require('../middleware/auth');

router.post('/calcular', validarSessaoCliente, controllerFrete.calcularFrete);
router.post('/consultar', validarSessaoCliente, controllerFrete.consultarFrete);

module.exports = router;