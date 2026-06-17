const CarrinhoDAO = require('../models/carrinho.dao');
const VariacaoDAO = require('../models/variacao-produto.dao');

// -------------------------------------------------------
// GET /carrinho
// Renderiza a página do carrinho com os itens do cliente
// -------------------------------------------------------
exports.verCarrinho = async (req, res) => {
  try {
    const id_cliente = req.session.usuario.id;
    const carrinho = await CarrinhoDAO.buscarOuCriar(id_cliente);
    const itens = await CarrinhoDAO.listarItens(carrinho.id_carrinho);

    const total = itens.reduce((acc, item) => acc + parseFloat(item.subtotal), 0);

    // Renderiza EJS só se o navegador pedir explicitamente HTML
    // Postman envia Accept: */* e cai no JSON
    const aceitaHTML = req.headers['accept'] && req.headers['accept'].includes('text/html');
    if (aceitaHTML) {
      //return res.render('carrinho', { itens, total, carrinho });
      return res.render('carrinho', { itens, total, carrinho, paginaAtiva: 'carrinho' });
    }

    return res.json({ carrinho: carrinho.id_carrinho, itens, total });
  } catch (err) {
    console.error('Erro ao carregar carrinho:', err);
    res.status(500).json({ erro: 'Erro ao carregar carrinho.' });
  }
};

// -------------------------------------------------------
// POST /carrinho/itens
// Body: { id_variacao, quantidade }
// -------------------------------------------------------
exports.adicionarItem = async (req, res) => {
  try {
    const id_cliente = req.session.usuario.id;
    const { id_variacao, quantidade } = req.body;
    const qtd = parseInt(quantidade) || 1;

    // Valida se a variação existe e tem estoque
    const variacao = await VariacaoDAO.buscarPorId(id_variacao);
    if (!variacao) {
      return res.status(404).json({ erro: 'Variação não encontrada.' });
    }
    if (variacao.estoque < qtd) {
      return res.status(400).json({ erro: `Estoque insuficiente. Disponível: ${variacao.estoque}` });
    }

    // Busca preço direto na tabela de produtos via variação
    const precoQuery = await require('../database/connection').query(
      `SELECT p.valor_produto FROM produtos p
       JOIN variacoes v ON v.produto_id = p.id_produto
       WHERE v.id_variacao = $1`,
      [id_variacao]
    );
    const preco = precoQuery.rows[0]?.valor_produto;
    if (!preco) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }

    const carrinho = await CarrinhoDAO.buscarOuCriar(id_cliente);
    const item = await CarrinhoDAO.adicionarItem(carrinho.id_carrinho, id_variacao, qtd, preco);

    res.status(201).json({ mensagem: 'Item adicionado ao carrinho.', item });
  } catch (err) {
    console.error('Erro ao adicionar item:', err);
    res.status(500).json({ erro: 'Erro ao adicionar item ao carrinho.' });
  }
};

// -------------------------------------------------------
// PUT /carrinho/itens/:id
// Body: { quantidade }
// -------------------------------------------------------
exports.atualizarItem = async (req, res) => {
  try {
    const id_cliente = req.session.usuario.id;
    const id_item = parseInt(req.params.id);
    const { quantidade } = req.body;
    const qtd = parseInt(quantidade);

    if (!qtd || qtd < 1) {
      return res.status(400).json({ erro: 'Quantidade inválida.' });
    }

    const carrinho = await CarrinhoDAO.buscarOuCriar(id_cliente);
    const itemAtual = await CarrinhoDAO.buscarItem(id_item, carrinho.id_carrinho);

    if (!itemAtual) {
      return res.status(404).json({ erro: 'Item não encontrado no carrinho.' });
    }
    if (itemAtual.estoque < qtd) {
      return res.status(400).json({ erro: `Estoque insuficiente. Disponível: ${itemAtual.estoque}` });
    }

    const itemAtualizado = await CarrinhoDAO.atualizarQuantidade(id_item, carrinho.id_carrinho, qtd);
    res.json({ mensagem: 'Quantidade atualizada.', item: itemAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar item:', err);
    res.status(500).json({ erro: 'Erro ao atualizar item do carrinho.' });
  }
};

// -------------------------------------------------------
// DELETE /carrinho/itens/:id
// Remove um item específico
// -------------------------------------------------------
exports.removerItem = async (req, res) => {
  try {
    const id_cliente = req.session.usuario.id;
    const id_item = parseInt(req.params.id);

    const carrinho = await CarrinhoDAO.buscarOuCriar(id_cliente);
    const removidos = await CarrinhoDAO.removerItem(id_item, carrinho.id_carrinho);

    if (!removidos) {
      return res.status(404).json({ erro: 'Item não encontrado no carrinho.' });
    }

    res.json({ mensagem: 'Item removido do carrinho.' });
  } catch (err) {
    console.error('Erro ao remover item:', err);
    res.status(500).json({ erro: 'Erro ao remover item do carrinho.' });
  }
};

// -------------------------------------------------------
// DELETE /carrinho
// Limpa todos os itens do carrinho
// -------------------------------------------------------
exports.limparCarrinho = async (req, res) => {
  try {
    const id_cliente = req.session.usuario.id;
    const carrinho = await CarrinhoDAO.buscarOuCriar(id_cliente);
    await CarrinhoDAO.limpar(carrinho.id_carrinho);

    res.json({ mensagem: 'Carrinho esvaziado.' });
  } catch (err) {
    console.error('Erro ao limpar carrinho:', err);
    res.status(500).json({ erro: 'Erro ao limpar carrinho.' });
  }
};
