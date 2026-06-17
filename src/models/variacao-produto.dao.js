const pool = require('../database/connection');
const Endereco = require('./Variacao-produto');


class VariacaoDAO {

  // Buscar variação por ID
  static async buscarPorId(id) {
    const query = `
      SELECT *
      FROM variacoes
      WHERE id_variacao = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }


  // Atualizar apenas o estoque (ex.: após compra ou ajuste)
static async atualizarEstoque(id, quantidade, client = pool) {
  const query = `
    UPDATE variacoes
    SET estoque = GREATEST(estoque + $1, 0)
    WHERE id_variacao = $2
    RETURNING id_variacao, estoque
  `;
  const result = await client.query(query, [quantidade, id]);
  return result.rows[0];
}


  // Buscar todas variações de um produto
  static async buscarPorProduto(produtoId) {
    const query = `
      SELECT *
      FROM variacoes
      WHERE produto_id = $1
    `;
    const result = await pool.query(query, [produtoId]);
    return result.rows;
  }

}

module.exports = VariacaoDAO;