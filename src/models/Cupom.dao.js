const pool = require('../database/connection');

class CupomDAO {

  // Cria cupom de troco na tabela "cupom"
  // Gerado automaticamente quando valor do cupom > total do pedido
  static async criar(cupom, client = pool) {
    const query = `
      INSERT INTO cupom (cliente_id, pedido_id, codigo, valor, usado, data_validade)
      VALUES ($1, $2, $3, $4, false, $5)
      RETURNING *
    `;
    const values = [
      cupom.cliente_id,
      cupom.pedido_id || null,
      cupom.codigo,
      cupom.valor,
      cupom.data_validade || null
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  // Busca pelo código (usado na validação do checkout)
  static async buscarPorCodigo(codigo, client = pool) {
    const query = `SELECT * FROM cupom WHERE codigo = $1`;
    const result = await client.query(query, [codigo]);
    return result.rows[0];
  }

  // Marca como usado ao finalizar pedido
  static async marcarComoUsado(id_cupom, client = pool) {
    const query = `
      UPDATE cupom SET usado = true
      WHERE id_cupom = $1
      RETURNING *
    `;
    const result = await client.query(query, [id_cupom]);
    return result.rows[0];
  }

  // Lista cupons disponíveis do cliente (não usados, não expirados)
  static async listarPorCliente(cliente_id, client = pool) {
    const query = `
      SELECT * FROM cupom
      WHERE cliente_id = $1
        AND usado = false
        AND (data_validade IS NULL OR data_validade > NOW())
      ORDER BY id_cupom DESC
    `;
    const result = await client.query(query, [cliente_id]);
    return result.rows;
  }

  static async listarTodosPorCliente(cliente_id, client = pool) {
    const query = `
      SELECT * FROM cupom
      WHERE cliente_id = $1
      ORDER BY id_cupom DESC
    `;
    const result = await client.query(query, [cliente_id]);
    return result.rows;
  }

  static async listarCuponsTrocaPorCliente(cliente_id, client = pool) {
    const query = `
    SELECT ct.*
    FROM cupons_troca ct
    JOIN solicitacoes_troca st ON ct.id_sol_troca = st.id_sol_troca
    JOIN pedidos p ON st.id_pedido = p.id_pedido
    WHERE p.id_cliente = $1
    ORDER BY ct.id_cupom_troca DESC
  `;
    const result = await client.query(query, [cliente_id]);
    return result.rows;
  }
}

module.exports = CupomDAO;