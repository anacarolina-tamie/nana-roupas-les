const express = require('express');
const router = express.Router();
const controllerEndereco = require('../controllers/controllerEndereco');

// /enderecos

router.put('/:id', controllerEndereco.atualizarEndereco);

router.get('/:id', controllerEndereco.buscarEndereco);

router.delete('/:id', controllerEndereco.excluirEndereco);

router.post('/:id/editar', controllerEndereco.atualizarEndereco);

module.exports = router;

