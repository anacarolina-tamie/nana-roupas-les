const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/controllerCliente');
const controllerCupom = require('../controllers/controllerCupom');

router.get('/', clienteController.listarClientes);
router.get('/consultar', clienteController.consultarClientes); 
router.get('/:id', clienteController.buscarCliente);
router.post('/', clienteController.criarCliente);
router.put('/:id', clienteController.atualizar);
router.delete('/:id', clienteController.excluirCliente);
router.post('/:id/editar', clienteController.editarCliente);
router.get('/:id/cupons', controllerCupom.buscarCuponsCliente);

module.exports = router;
