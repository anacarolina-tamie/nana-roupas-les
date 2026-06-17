const ProdutoDAO = require('../models/produto.dao');

// -------------------------------------------------------
// GET /produtos
// Query param opcional: ?busca=nome
// -------------------------------------------------------
exports.listar = async (req, res) => {
  try {
    const { busca } = req.query;

    const produtos = busca
      ? await ProdutoDAO.buscarPorNome(busca)
      : await ProdutoDAO.listar();

    const aceitaHTML = req.headers['accept'] && req.headers['accept'].includes('text/html');
    if (aceitaHTML) {
      return res.render('tela-inicial', { produtos, paginaAtiva: '/tela-inicial' });
    }

    res.json({ produtos });
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ erro: 'Erro ao buscar produtos.' });
  }
};

// -------------------------------------------------------
// GET /produtos/:id
// Retorna produto + variações disponíveis (estoque > 0)
// -------------------------------------------------------
exports.buscarPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = await ProdutoDAO.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const aceitaHTML = req.headers['accept'] && req.headers['accept'].includes('text/html');
    if (aceitaHTML) {
      return res.render('detalhes-produto', { produto, paginaAtiva: '' });
    }

    res.json({ produto });
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    res.status(500).json({ erro: 'Erro ao buscar produto.' });
  }
};