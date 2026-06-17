const express = require('express');
const router = express.Router();
const controllerProduto = require('../controllers/controllerProduto');
const { validarSessaoCliente } = require('../middleware/auth');

router.get('/produtos',     validarSessaoCliente, controllerProduto.listar);
router.get('/produtos/:id', validarSessaoCliente, controllerProduto.buscarPorId);

module.exports = router;