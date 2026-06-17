const pool = require('../database/connection');

class DashboardDAO {

  static async vendasPorMes(idProduto, meses = 6, inicio = null, fim = null) {
    const periodoSeguro = [3, 6, 12].includes(Number(meses)) ? Number(meses) : 6;

    const filtroData = inicio && fim
      ? `AND p.created_at >= $${idProduto ? 2 : 1}::date AND p.created_at < ($${idProduto ? 3 : 2}::date + INTERVAL '1 day')`
      : `AND p.created_at >= DATE_TRUNC('month', NOW()) - (INTERVAL '1 month' * ($${idProduto ? 2 : 1} - 1))`;

    if (idProduto) {
      const params = inicio && fim ? [Number(idProduto), inicio, fim] : [Number(idProduto), periodoSeguro];
      const query = `
            SELECT
              TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') AS mes,
              TO_CHAR(DATE_TRUNC('month', p.created_at), 'Mon/YY')  AS mes_label,
              COALESCE(SUM(ip.qtde_item), 0)::int                    AS total_unidades
            FROM pedidos p
            JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
            JOIN variacoes v ON v.id_variacao = ip.id_variacao
            WHERE p.status_pedido NOT IN ('cancelado', 'estornado')
              AND v.produto_id = $1
              ${filtroData}
            GROUP BY DATE_TRUNC('month', p.created_at)
            ORDER BY DATE_TRUNC('month', p.created_at)
        `;
      const { rows } = await pool.query(query, params);
      return rows;
    }

    const params = inicio && fim ? [inicio, fim] : [periodoSeguro];
    const query = `
        SELECT
          TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') AS mes,
          TO_CHAR(DATE_TRUNC('month', p.created_at), 'Mon/YY')  AS mes_label,
          COALESCE(SUM(ip.qtde_item), 0)::int                    AS total_unidades
        FROM pedidos p
        JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
        WHERE p.status_pedido NOT IN ('cancelado', 'estornado')
          ${filtroData}
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY DATE_TRUNC('month', p.created_at)
    `;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async listarProdutos() {
    const query = `
      SELECT id_produto, nome_produto
      FROM produtos
      ORDER BY nome_produto
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async totalFaturadoPorMes(meses = 6, inicio = null, fim = null) {
    const periodoSeguro = [3, 6, 12].includes(Number(meses)) ? Number(meses) : 6;

    const filtroData = inicio && fim
      ? `AND p.created_at >= $1::date AND p.created_at < ($2::date + INTERVAL '1 day')`
      : `AND p.created_at >= DATE_TRUNC('month', NOW()) - (INTERVAL '1 month' * ($1 - 1))`;

    const params = inicio && fim ? [inicio, fim] : [periodoSeguro];

    const query = `
        SELECT
          TO_CHAR(DATE_TRUNC('month', p.created_at), 'YYYY-MM') AS mes,
          COALESCE(SUM(ip.qtde_item * pr.valor_produto), 0)::numeric(10,2) AS total_faturado
        FROM pedidos p
        JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
        JOIN variacoes v ON v.id_variacao = ip.id_variacao
        JOIN produtos pr ON pr.id_produto = v.produto_id
        WHERE p.status_pedido NOT IN ('cancelado', 'estornado')
          ${filtroData}
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY DATE_TRUNC('month', p.created_at)
    `;
    const { rows } = await pool.query(query, params);
    return rows;
  }
}

module.exports = DashboardDAO;