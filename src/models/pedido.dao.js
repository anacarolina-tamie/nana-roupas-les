const pool = require('../database/connection');
const Pedido = require('./Pedido');

class PedidoDAO {

  // Cria um pedido
  static async criar(pedido, client = pool) {
    const query = `
      INSERT INTO pedidos (
        status_pedido,
        valor_produtos,
        frete,
        desconto,
        valor_total,
        id_cliente,
        id_endereco
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      pedido.status_pedido || 'Em processamento',
      pedido.valor_produtos || 0, // ✅ novo campo
      pedido.frete,
      pedido.desconto || 0,
      pedido.valor_total,
      pedido.id_cliente,
      pedido.id_endereco
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  // Busca um pedido por ID
  static async buscarPorId(id_pedido, client = pool) {
    const query = `
      SELECT * FROM pedidos
      WHERE id_pedido = $1
    `;
    const result = await client.query(query, [id_pedido]);
    return result.rows[0];
  }

  // Lista todos os pedidos de um cliente
static async listarPorCliente(id_cliente, client = pool) {
  const query = `
  SELECT p.*,
    (
      SELECT COALESCE(SUM(pr.valor_produto * ip.qtde_item), 0)
      FROM item_pedido ip
      JOIN variacoes v ON v.id_variacao = ip.id_variacao
      JOIN produtos pr ON pr.id_produto = v.produto_id
      WHERE ip.id_pedido = p.id_pedido
    ) AS valor_produtos_calculado
  FROM pedidos p
  WHERE p.id_cliente = $1
  ORDER BY p.id_pedido DESC
`;
  const result = await client.query(query, [id_cliente]);
  console.log('DEBUG pedido[0]:', JSON.stringify(result.rows[0]));  // ← adicione isso
  return result.rows;
}
  /*static async listarPorCliente(id_cliente, client = pool) {
    const query = `
      SELECT * FROM pedidos
      WHERE id_cliente = $1
      ORDER BY id_pedido DESC
    `;
    const result = await client.query(query, [id_cliente]);
    return result.rows;
  }
    */

  // Atualiza o status do pedido
  static async atualizarStatus(id_pedido, status_pedido, client = pool) {
    const query = `
      UPDATE pedidos
      SET status_pedido = $1
      WHERE id_pedido = $2
      RETURNING *
    `;
    const result = await client.query(query, [status_pedido, id_pedido]);
    return result.rows[0];
  }

  // Lista todos os pedidos com nome do cliente e contagem de itens
  static async listarTodos(client = pool) {
    const query = `
    SELECT
      p.id_pedido,
      p.status_pedido,
      p.valor_total,
      p.created_at,
      c.nome_cliente,
      COALESCE(SUM(ip.qtde_item), 0) AS qtde_itens
    FROM pedidos p
    JOIN clientes c ON c.id_cliente = p.id_cliente
    LEFT JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
    GROUP BY p.id_pedido, c.nome_cliente, p.created_at, p.status_pedido, p.valor_total
    ORDER BY p.id_pedido DESC
  `;
    const result = await client.query(query);
    return result.rows;
  }

}

module.exports = PedidoDAO;