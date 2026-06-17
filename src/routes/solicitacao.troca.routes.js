const { validarSessaoAdmin } = require('../middleware/auth');
const controllerSolicitacaoTrocar = require('../controllers/controllerSolicitacaoTroca');
const express = require('express');
const router = express.Router();

router.get('/solicitacoes-troca',                            validarSessaoAdmin, controllerSolicitacaoTroca.listarSolicitacoesTroca);
router.post('/solicitacoes-troca/:id/aprovar',               validarSessaoAdmin, controllerSolicitacaoTroca.aprovarTroca);
router.post('/solicitacoes-troca/:id/negar',                 validarSessaoAdmin, controllerSolicitacaoTroca.negarTroca);
router.post('/solicitacoes-troca/:id/confirmar-recebimento', validarSessaoAdmin, controllerSolicitacaoTroca.confirmarRecebimento);

module.exports = router;