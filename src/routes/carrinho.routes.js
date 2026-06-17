const express = require('express');
const router = express.Router();
const controllerCarrinho = require('../controllers/controllerCarrinho');
const { validarSessaoCliente } = require('../middleware/auth');
 
// Todas as rotas do carrinho exigem login de cliente
router.use(validarSessaoCliente);
 
router.get('/carrinho',                controllerCarrinho.verCarrinho);
router.post('/carrinho/itens',         controllerCarrinho.adicionarItem);
router.put('/carrinho/itens/:id',      controllerCarrinho.atualizarItem);
router.delete('/carrinho/itens/:id',   controllerCarrinho.removerItem);
router.delete('/carrinho',             controllerCarrinho.limparCarrinho);
 
module.exports = router;