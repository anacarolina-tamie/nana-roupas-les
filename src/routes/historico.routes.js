const express = require('express');
const router = express.Router();
const controllerHistorico = require('../controllers/controllerHistorico');
const { validarSessaoCliente } = require('../middleware/auth');


router.get('/historico', validarSessaoCliente, controllerHistorico.listarHistorico);
router.post('/historico/solicitar-troca/:id_item_pedido', validarSessaoCliente, controllerHistorico.solicitarTroca);
router.get('/historico/:id_pedido', validarSessaoCliente, controllerHistorico.detalharPedido);
router.post('/historico/solicitar-troca-total', validarSessaoCliente, controllerHistorico.solicitarTrocaTotal);

module.exports = router;