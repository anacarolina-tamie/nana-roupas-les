const express = require('express');
const router = express.Router();
const controllerFinalizarpedido = require('../controllers/controllerFinalizarpedido');
const { validarSessaoCliente } = require('../middleware/auth');


// Rotas para finalizar pedido
router.get('/finalizar-pedido', validarSessaoCliente, controllerFinalizarpedido.finalizarPedido);
router.post('/finalizar-pedido', validarSessaoCliente, controllerFinalizarpedido.processarPedido);
router.post('/cupons/validar', validarSessaoCliente, controllerFinalizarpedido.validarCupomRoute);

module.exports = router;