const express = require('express');
const router = express.Router();
const controllerNavegacao = require('../controllers/controllerNavegacao');
const { validarSessaoCliente, validarSessaoAdmin } = require('../middleware/auth');
const controllerAuth = require('../controllers/auth.controller');
const controllerSolicitacaoTroca = require('../controllers/controllerSolicitacaoTroca');
const controllerEstoque = require('../controllers/controllerEstoque');

router.get('/', controllerNavegacao.index);

router.get('/login', controllerNavegacao.login);
router.post('/login', controllerAuth.loginPost);

router.get('/tela-inicial', validarSessaoCliente, controllerNavegacao.telaInicial);
router.get('/lista-clientes', validarSessaoAdmin, controllerNavegacao.lista);

router.get('/cadastrar-cliente', controllerNavegacao.cadastrar);

router.get('/editar-endereco', controllerNavegacao.editarEndereco); 

//router.get('/editar-cliente/:id', controllerNavegacao.editar);

router.get('/editar-cliente/:id', controllerNavegacao.editarCliente);

router.get('/detalhes-cliente/:id', controllerNavegacao.detalhes);

router.get('/tela-inicial', controllerNavegacao.telaInicial);

router.get('/configuracoes', controllerNavegacao.configuracoes);

router.get('/adicionar-cartao', validarSessaoCliente, controllerNavegacao.adicionarCartao);

router.get('/detalhes-produto', controllerNavegacao.detalhesProduto);

router.get('/adicionar-endereco', validarSessaoCliente, controllerNavegacao.adicionarEndereco);
router.get('/editar-endereco/:id', validarSessaoCliente, controllerNavegacao.editarEndereco);

router.get('/logout', controllerAuth.logout);

//para a listagem de diferentes pedidos:
router.post('/pedidos/:id_pedido/aprovar',   validarSessaoAdmin, controllerNavegacao.aprovarPedido);
router.post('/pedidos/:id_pedido/reprovar',  validarSessaoAdmin, controllerNavegacao.reprovarPedido);
router.post('/pedidos/:id_pedido/despachar', validarSessaoAdmin, controllerNavegacao.despacharPedido);
router.post('/pedidos/:id_pedido/entregar',  validarSessaoAdmin, controllerNavegacao.confirmarEntrega);
router.get('/lista-pedidos', validarSessaoAdmin, controllerNavegacao.listarPedidos);

router.get('/solicitacoes-troca',                            validarSessaoAdmin, controllerSolicitacaoTroca.listarSolicitacoesTroca);
router.post('/solicitacoes-troca/:id/aprovar',               validarSessaoAdmin, controllerSolicitacaoTroca.aprovarTroca);
router.post('/solicitacoes-troca/:id/negar',                 validarSessaoAdmin, controllerSolicitacaoTroca.negarTroca);
router.post('/solicitacoes-troca/:id/recebida',          validarSessaoAdmin, controllerSolicitacaoTroca.marcarRecebida);
router.post('/solicitacoes-troca/:id/nao-recebida',      validarSessaoAdmin, controllerSolicitacaoTroca.marcarNaoRecebida);
router.post('/solicitacoes-troca/:id/devolver-estoque',  validarSessaoAdmin, controllerSolicitacaoTroca.devolverEstoque);
router.post('/solicitacoes-troca/:id/descartar',         validarSessaoAdmin, controllerSolicitacaoTroca.descartar);
router.get('/estoque', validarSessaoAdmin, controllerEstoque.listarEstoque);


module.exports = router;