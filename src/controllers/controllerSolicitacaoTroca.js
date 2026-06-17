const SolicitacaoTrocaDAO = require('../models/SolicitacaoTroca.dao');
const pool = require('../database/connection');

exports.listarSolicitacoesTroca = async (req, res) => {
  try {
    const solicitacoes = await SolicitacaoTrocaDAO.listarTodas();
    res.render('solicitacoes-troca', { solicitacoes, paginaAtiva: 'trocas' });
  } catch (error) {
    console.error('Erro ao listar solicitações de troca:', error);
    res.status(500).send('Erro ao carregar solicitações de troca.');
  }
};

exports.aprovarTroca = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Aprovada');
    res.json({ mensagem: 'Troca aprovada! O cliente foi notificado e deve encaminhar as mercadorias.' });
  } catch (error) {
    console.error('Erro ao aprovar troca:', error);
    res.status(500).json({ mensagem: 'Erro ao aprovar a troca.' });
  }
};

exports.negarTroca = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Negada');
    res.json({ mensagem: 'Troca negada. O cliente foi notificado e o fluxo foi encerrado.' });
  } catch (error) {
    console.error('Erro ao negar troca:', error);
    res.status(500).json({ mensagem: 'Erro ao negar a troca.' });
  }
};

exports.marcarRecebida = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    console.log('1 - id recebido:', id);

    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Recebida', client);
    console.log('2 - status atualizado');

    const cupom = await SolicitacaoTrocaDAO.criarCupomTroca(id, client);
    console.log('3 - cupom gerado:', cupom);

    await client.query('COMMIT');
    console.log('4 - commit ok');

    res.json({ mensagem: `Mercadoria recebida! Cupom ${cupom.cod_cupom_troca} gerado no valor de R$ ${parseFloat(cupom.valor_cupom_troca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para o cliente.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('ERRO:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar status.' });
  } finally {
    client.release();
  }
};
exports.marcarNaoRecebida = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Não recebida');
    res.json({ mensagem: 'Mercadoria marcada como não recebida.' });
  } catch (error) {
    console.error('Erro ao marcar como não recebida:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar status.' });
  }
};

exports.devolverEstoque = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitacaoTrocaDAO.devolverAoEstoque(id);
    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Devolvida ao estoque');
    res.json({ mensagem: 'Produto devolvido ao estoque com sucesso!' });
  } catch (error) {
    console.error('Erro ao devolver ao estoque:', error);
    res.status(500).json({ mensagem: 'Erro ao devolver ao estoque.' });
  }
};

exports.descartar = async (req, res) => {
  try {
    const { id } = req.params;
    await SolicitacaoTrocaDAO.atualizarStatus(id, 'Descartada');
    res.json({ mensagem: 'Produto descartado.' });
  } catch (error) {
    console.error('Erro ao descartar:', error);
    res.status(500).json({ mensagem: 'Erro ao descartar.' });
  }
};
