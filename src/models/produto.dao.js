const pool = require('../database/connection');

class ProdutoDAO {

  /*static async listar() {
    const query = `
      SELECT id_produto, nome_produto, categoria, valor_produto, materiais, url_imagem
      FROM produtos
      ORDER BY nome_produto
    `;
    const result = await pool.query(query);
    return result.rows;
  }
*/

  static async listar() {
    const result = await pool.query(`
    SELECT p.*,
      COALESCE(SUM(v.estoque), 0) AS estoque_total
    FROM produtos p
    LEFT JOIN variacoes v ON v.produto_id = p.id_produto
    GROUP BY p.id_produto
    ORDER BY p.created_at DESC
  `);
    return result.rows;
  }


  static async buscarPorNome(termo) {
    const query = `
      SELECT id_produto, nome_produto, categoria, valor_produto, materiais, url_imagem
      FROM produtos
      WHERE nome_produto ILIKE $1
      ORDER BY nome_produto
    `;
    const result = await pool.query(query, [`%${termo}%`]);
    return result.rows;
  }

  // Retorna o produto com todas as suas variações (cor + tamanho)
  static async buscarPorId(id) {
    const queryProduto = `
      SELECT id_produto, nome_produto, categoria, valor_produto, materiais, url_imagem
      FROM produtos
      WHERE id_produto = $1
    `;
    const resultProduto = await pool.query(queryProduto, [id]);
    const produto = resultProduto.rows[0];

    if (!produto) return null;

    const queryVariacoes = `
      SELECT
        v.id_variacao,
        v.tamanho,
        v.estoque,
        v.url_imagem,
        c.id_cor,
        c.nome_cor
      FROM variacoes v
      JOIN cores c ON v.cor_id = c.id_cor
      WHERE v.produto_id = $1
        AND v.estoque > 0
      ORDER BY c.nome_cor, v.tamanho
    `;
    const resultVariacoes = await pool.query(queryVariacoes, [id]);
    produto.variacoes = resultVariacoes.rows;

    return produto;
  }

}

module.exports = ProdutoDAO;