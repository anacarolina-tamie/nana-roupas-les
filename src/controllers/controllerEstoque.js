const EstoqueDAO = require('../models/estoque.dao');

exports.listarEstoque = async (req, res) => {
  try {
    const variacoes = await EstoqueDAO.listar();
    res.render('estoque', {
      variacoes,
      paginaAtiva: 'estoque'
    });
  } catch (err) {
    console.error('Erro ao buscar estoque:', err);
    res.status(500).send('Erro interno ao carregar o estoque.');
  }
};

exports.atualizarEstoque = async (req, res) => {
  const idVariacao = parseInt(req.params.id, 10);
  const estoque    = parseInt(req.body.estoque, 10);

  if (isNaN(idVariacao) || isNaN(estoque) || estoque < 0) {
    return res.status(400).json({ mensagem: 'Dados inválidos.' });
  }

  try {
    const rowCount = await EstoqueDAO.atualizarEstoque(idVariacao, estoque);

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: 'Variação não encontrada.' });
    }

    res.json({ mensagem: 'Estoque atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar estoque:', err);
    res.status(500).json({ mensagem: 'Erro interno ao atualizar o estoque.' });
  }
};