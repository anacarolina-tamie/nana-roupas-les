const pool = require('../database/connection');
//const Transacao = require('./Transacao');

class TransacaoDAO {

  // Cria uma transação
  static async criar(transacao, client = pool) {
    const query = `
      INSERT INTO transacoes (status_transacao, id_pedido, id_cartao_1, id_cartao_2, id_cupom_troca)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      transacao.status_transacao || 'Em processamento',
      transacao.id_pedido,
      transacao.id_cartao_1,
      transacao.id_cartao_2   || null,
      transacao.id_cupom_troca || null
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  // Busca transação por pedido
  static async buscarPorPedido(id_pedido, client = pool) {
    const query = `
      SELECT * FROM transacoes
      WHERE id_pedido = $1
    `;
    const result = await client.query(query, [id_pedido]);
    return result.rows[0];
  }

  // Atualiza o status da transação
  static async atualizarStatus(id_transacao, status_transacao, client = pool) {
    const query = `
      UPDATE transacoes
      SET status_transacao = $1
      WHERE id_transacao = $2
      RETURNING *
    `;
    const result = await client.query(query, [status_transacao, id_transacao]);
    return result.rows[0];
  }

}

module.exports = TransacaoDAO;