const express = require('express');
const router  = express.Router();
const estoqueController = require('../controllers/controllerEstoque');

router.get('/', estoqueController.listarEstoque);
router.patch('/:id', estoqueController.atualizarEstoque);

module.exports = router;
