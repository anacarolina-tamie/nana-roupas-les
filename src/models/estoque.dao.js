const pool = require('../database/connection');

class EstoqueDAO {
  static async listar() {
    const query = `
      SELECT
        v.id_variacao,
        p.nome_produto,
        v.url_imagem,
        c.nome_cor,
        v.tamanho,
        v.estoque
      FROM variacoes v
      JOIN produtos p ON p.id_produto = v.produto_id
      JOIN cores    c ON c.id_cor     = v.cor_id
      ORDER BY v.id_variacao
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async atualizarEstoque(id_variacao, estoque) {
    const query = `
      UPDATE variacoes
      SET estoque = $1
      WHERE id_variacao = $2
    `;
    const result = await pool.query(query, [estoque, id_variacao]);
    return result.rowCount;
  }
}

module.exports = EstoqueDAO;
