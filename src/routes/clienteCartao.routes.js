const express = require('express');
const router = express.Router();
const controllerCartao = require('../controllers/controllerCartao');

router.post('/:id/cartoes', controllerCartao.adicionarCartao);

router.get('/:id/cartoes', controllerCartao.listarCartoes);

module.exports = router;
