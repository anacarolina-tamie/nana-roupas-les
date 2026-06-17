const express = require('express');
const router  = express.Router();
const controllerFavoritos= require('../controllers/controllerFavoritos');
const { validarSessaoCliente } = require('../middleware/auth');

router.post('/toggle', validarSessaoCliente, controllerFavoritos.toggle);
router.get('/',        validarSessaoCliente, controllerFavoritos.listar);

module.exports = router;