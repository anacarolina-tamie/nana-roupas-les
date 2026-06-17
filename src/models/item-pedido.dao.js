const pool = require('../database/connection');
const ItemPedido = require('./Item-pedido');

class ItemPedidoDAO {

  // Cria um item de pedido
  static async criar(item, client = pool) {
    const query = `
      INSERT INTO item_pedido (qtde_item, id_variacao, id_pedido)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      item.qtde_item,
      item.id_variacao,
      item.id_pedido
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  // Lista todos os itens de um pedido
  static async listarPorPedido(id_pedido, client = pool) {
    const query = `
      SELECT
        ip.id_item_pedido,
        ip.qtde_item,
        ip.id_variacao,
        ip.id_pedido,
        p.nome_produto,
        v.url_imagem,
        p.valor_produto AS preco,
        v.tamanho,
        c.nome_cor
      FROM item_pedido ip
      JOIN variacoes v  ON ip.id_variacao = v.id_variacao
      JOIN produtos p   ON v.produto_id   = p.id_produto
      JOIN cores c      ON v.cor_id       = c.id_cor
      WHERE ip.id_pedido = $1
      ORDER BY ip.id_item_pedido
    `;
    const result = await client.query(query, [id_pedido]);
    return result.rows;
  }

  static async buscarPorId(id_item_pedido, client = pool) {
  const query = `
    SELECT
      ip.id_item_pedido,
      ip.qtde_item,
      ip.id_pedido,
      ip.id_variacao
    FROM item_pedido ip
    WHERE ip.id_item_pedido = $1
  `;
  const result = await client.query(query, [id_item_pedido]);
  return result.rows[0];
}

}

module.exports = ItemPedidoDAO;