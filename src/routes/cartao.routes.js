const express = require('express');
const router = express.Router();
const controllerCartao = require('../controllers/controllerCartao');

// /cartoes

router.delete('/:id', controllerCartao.excluirCartao);

router.put('/:id/preferencial', controllerCartao.definirCartaoPreferencial);

module.exports = router;
