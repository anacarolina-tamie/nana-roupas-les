const pool = require('../database/connection');
const ClienteDAO = require('../models/cliente.dao');
const EnderecoDAO = require('../models/endereco.dao');
const ProdutoDAO = require('../models/produto.dao.js');
const PedidoDAO = require('../models/pedido.dao');
const ItemPedidoDAO = require('../models/item-pedido.dao');
const CupomDAO = require('../models/Cupom.dao');
const VariacaoDAO = require('../models/variacao-produto.dao');
const FavoritosDAO = require('../models/favoritos.dao'); 

exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await PedidoDAO.listarTodos();
    res.render('lista-pedidos', { pedidos, paginaAtiva: 'pedidos' });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).send('Erro ao carregar pedidos.');
  }
};

exports.index = (req, res) => {
  res.redirect('/login');
};

exports.login = (req, res) => {
  res.render('login');
};

exports.cadastrar = (req, res) => {
  res.render('cadastrar-cliente', {
    cadastro: {
      enderecos: [],
      cartoes: []
    }
  });
};


exports.telaInicial = async (req, res) => {
  try {
    console.log('1 - iniciando telaInicial');
    const produtos = await ProdutoDAO.listar();
    console.log('2 - produtos carregados:', produtos?.length);

    let idsFavoritos = [];
    if (req.session?.usuario?.tipo === 'cliente') {
      console.log('3 - buscando favoritos do cliente:', req.session.usuario.id);
      idsFavoritos = await FavoritosDAO.buscarIdsFavoritos(req.session.usuario.id);
      console.log('4 - favoritos:', idsFavoritos);
    }

    res.render('tela-inicial', { produtos, idsFavoritos, paginaAtiva: 'produtos' });
  } catch (err) {
    console.error('ERRO telaInicial:', err); // ← vai mostrar o erro real
    res.status(500).send('Erro ao carregar produtos.');
  }
};

exports.configuracoes = (req, res) => {
  res.render('configuracoes', {
    paginaAtiva: 'configuracoes',
    clienteId: req.session.usuario?.id
  });
}

exports.adicionarEndereco = (req, res) => {
  res.render('adicionar-endereco', {
    paginaAtiva: 'adicionar-endereco',
    clienteId: req.session.usuario?.id
  });
}

exports.editarEndereco = async (req, res) => {
  try {
    const id = req.params.id;

    console.log('id recebido:', id); // adicione isso
    const endereco = await EnderecoDAO.buscarPorId(id);
    console.log('endereco encontrado:', endereco); // e isso

    res.render('editar-endereco', {
      paginaAtiva: 'editar-endereco',
      endereco,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar endereco');
  }
};

exports.adicionarCartao = (req, res) => {
  res.render('adicionar-cartao', {
    paginaAtiva: 'adicionar-cartao',
    clienteId: req.session.usuario?.id
  });
}

exports.lista = async (req, res) => {
  try {
    const clientes = await ClienteDAO.listarClientes();
    res.render('lista-clientes', { clientes });
  } catch (erro) {
    console.error("Erro ao listar clientes:", erro);
    res.render('erro', { mensagem: "Erro ao carregar clientes" });
  }
};

exports.editarCliente = async (req, res) => {
  try {
    const id = req.params.id;

    const cliente = await ClienteDAO.buscarPorId(id);

    res.render('editar-cliente', {
      paginaAtiva: 'editar-cliente',
      cliente,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar cliente');
  }
};



exports.detalhes = async (req, res) => {
  try {
    const id = req.params.id;
    const cliente = await ClienteDAO.buscarPorId(id);

    const enderecos = await EnderecoDAO.buscarPorCliente(id);

    if (!cliente) {
      return res.status(404).send("Cliente não encontrado");
    }

    res.render('detalhes-cliente', {
      cliente: cliente,
      enderecos: enderecos || []
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).send("Erro ao carregar detalhes");
  }
};

exports.detalhesProduto = async (req, res) => {
  try {
    const id = req.params.id;
    const produto = await ProdutoDAO.buscarPorId(id);
    console.log(JSON.stringify(produto.variacoes, null, 2));
    if (!produto) {
      return res.status(404).send('Produto não encontrado.');
    }

    res.render('detalhes-produto', { produto });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar produto.');
  }
};

// ── APROVAR PEDIDO ──────────────────────────────────────────────────
exports.aprovarPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pedido } = req.params;
    const pedido = await PedidoDAO.buscarPorId(id_pedido);

    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    if (pedido.status_pedido !== 'Em processamento') {
      return res.status(400).json({ mensagem: 'Apenas pedidos "Em processamento" podem ser aprovados.' });
    }

    await PedidoDAO.atualizarStatus(id_pedido, 'Aprovado', client);
    await client.query('COMMIT');
    return res.json({ mensagem: 'Pedido aprovado com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao aprovar pedido:', error);
    return res.status(500).json({ mensagem: 'Erro ao aprovar pedido.' });
  } finally {
    client.release();
  }
};

// ── REPROVAR PEDIDO ─────────────────────────────────────────────────
exports.reprovarPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pedido } = req.params;
    const pedido = await PedidoDAO.buscarPorId(id_pedido);

    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    if (pedido.status_pedido !== 'Em processamento') {
      return res.status(400).json({ mensagem: 'Apenas pedidos "Em processamento" podem ser reprovados.' });
    }

    await client.query('BEGIN');

    // Atualiza status do pedido
    await PedidoDAO.atualizarStatus(id_pedido, 'Reprovado', client);

    // Devolve o estoque de cada item do pedido
    const itens = await ItemPedidoDAO.listarPorPedido(id_pedido);
    for (const item of itens) {
      await VariacaoDAO.atualizarEstoque(item.id_variacao, item.qtde_item, client);
    }

    // Gera cupom TROCO com o valor total do pedido
    const crypto = require('crypto');
    const codigoTroco = 'TROCO-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    await CupomDAO.criar({
      cliente_id: pedido.id_cliente,
      pedido_id: parseInt(id_pedido),
      codigo: codigoTroco,
      valor: parseFloat(pedido.valor_total),
      data_validade: null
    }, client);

    await client.query('COMMIT');
    return res.json({ mensagem: 'Pedido reprovado e cupom de estorno gerado para o cliente.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao reprovar pedido:', error);
    return res.status(500).json({ mensagem: 'Erro ao reprovar pedido.' });
  } finally {
    client.release();
  }
};

// ── DESPACHAR PEDIDO (Em trânsito) ──────────────────────────────────
exports.despacharPedido = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pedido } = req.params;
    const pedido = await PedidoDAO.buscarPorId(id_pedido);

    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    if (pedido.status_pedido !== 'Aprovado') {
      return res.status(400).json({ mensagem: 'Apenas pedidos "Aprovados" podem ser despachados.' });
    }

    await PedidoDAO.atualizarStatus(id_pedido, 'Em trânsito', client);
    await client.query('COMMIT');
    return res.json({ mensagem: 'Pedido marcado como Em trânsito!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao despachar pedido:', error);
    return res.status(500).json({ mensagem: 'Erro ao despachar pedido.' });
  } finally {
    client.release();
  }
};

// ── CONFIRMAR ENTREGA ────────────────────────────────────────────────
exports.confirmarEntrega = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id_pedido } = req.params;
    const pedido = await PedidoDAO.buscarPorId(id_pedido);

    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado.' });
    if (pedido.status_pedido !== 'Em trânsito') {
      return res.status(400).json({ mensagem: 'Apenas pedidos "Em trânsito" podem ser confirmados como entregues.' });
    }

    await PedidoDAO.atualizarStatus(id_pedido, 'Entregue', client);
    await client.query('COMMIT');
    return res.json({ mensagem: 'Entrega confirmada com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao confirmar entrega:', error);
    return res.status(500).json({ mensagem: 'Erro ao confirmar entrega.' });
  } finally {
    client.release();
  }
};