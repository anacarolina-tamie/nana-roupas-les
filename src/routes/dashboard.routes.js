const controllerDashboard = require('../controllers/controllerDashboard');
const express = require('express');
const router = express.Router();    
const { validarSessaoAdmin } = require('../middleware/auth');

router.get('/', validarSessaoAdmin, controllerDashboard.renderDashboard);
router.get('/vendas', validarSessaoAdmin, controllerDashboard.getVendas);

module.exports = router;   
