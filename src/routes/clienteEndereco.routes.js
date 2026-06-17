const express = require('express');
const router = express.Router();
const controllerEndereco = require('../controllers/controllerEndereco');

router.post('/:id/enderecos', controllerEndereco.criarEndereco);

router.get('/:id/enderecos', controllerEndereco.buscarEnderecosCliente);

module.exports = router;
