const pool = require('../database/connection');
const SolicitacaoTroca = require('./SolicitacaoTroca');

class SolicitacaoTrocaDAO {

  // Cria uma solicitação de troca
  // Cria uma solicitação de troca parcial
  static async criar(id_item_pedido, id_pedido, qtde_item, motivo_troca, client = pool) {
    const query = `
    INSERT INTO solicitacoes_troca (status_troca, id_item_pedido, id_pedido, qtde_item, motivo_troca)
    VALUES ('Pendente', $1, $2, $3, $4)
    RETURNING *
  `;
    const result = await client.query(query, [id_item_pedido, id_pedido, qtde_item, motivo_troca]);
    return result.rows[0];
  }

  // Soma total de quantidade já solicitada para um item (pode ter múltiplas solicitações parciais)
  static async somarQuantidadePorItem(id_item_pedido, client = pool) {
    const query = `
    SELECT COALESCE(SUM(qtde_item), 0) AS total
    FROM solicitacoes_troca
    WHERE id_item_pedido = $1
  `;
    const result = await client.query(query, [id_item_pedido]);
    return parseInt(result.rows[0].total);
  }

  // Busca todas as solicitações de um item (não apenas a última)
  static async buscarPorItemPedido(id_item_pedido, client = pool) {
    const query = `
    SELECT * FROM solicitacoes_troca
    WHERE id_item_pedido = $1
    ORDER BY id_sol_troca DESC
  `;
    const result = await client.query(query, [id_item_pedido]);
    return result.rows; // agora retorna array
  }

  // Lista todas as solicitações (para o admin)
  static async listarTodas(client = pool) {
    const query = `
    SELECT
      st.id_sol_troca,
      st.status_troca,
      st.id_item_pedido,
      st.qtde_item,         -- ← agora pega da solicitação
      st.motivo_troca,
      ip.id_pedido,
      p.nome_produto,
      v.url_imagem,
      c.nome_cliente
    FROM solicitacoes_troca st
    JOIN item_pedido ip  ON st.id_item_pedido = ip.id_item_pedido
    JOIN variacoes v     ON ip.id_variacao    = v.id_variacao
    JOIN produtos p      ON v.produto_id      = p.id_produto
    JOIN pedidos ped     ON ip.id_pedido      = ped.id_pedido
    JOIN clientes c      ON ped.id_cliente    = c.id_cliente
    ORDER BY st.id_sol_troca DESC
  `;
    const result = await client.query(query);
    return result.rows;
  }

  // Atualiza o status da solicitação (admin aprova ou reprova)
  static async atualizarStatus(id_sol_troca, status_troca, client = pool) {
    const query = `
    UPDATE solicitacoes_troca
    SET status_troca = $1
    WHERE id_sol_troca = $2
    RETURNING *
  `;
    const result = await client.query(query, [status_troca, id_sol_troca]);
    return result.rows[0];
  }

  static async criarTrocaTotal(id_pedido, itens, client = pool) {
    const clienteTx = await pool.connect();
    try {
      await clienteTx.query('BEGIN');

      const inseridos = [];
      for (const item of itens) {
        const res = await clienteTx.query(
          `INSERT INTO solicitacoes_troca (status_troca, id_item_pedido, motivo_troca, id_pedido, qtde_item)
         VALUES ('Pendente', $1, $2, $3, $4)
         RETURNING *`,
          [item.id_item_pedido, item.motivo.trim(), id_pedido, item.qtd]
        );
        inseridos.push(res.rows[0]);
      }

      await clienteTx.query('COMMIT');
      return inseridos;
    } catch (err) {
      await clienteTx.query('ROLLBACK');
      throw err;
    } finally {
      clienteTx.release();
    }
  }

  static async devolverAoEstoque(id_sol_troca, client = pool) {
    const query = `
    UPDATE variacoes v
    SET estoque = v.estoque + st.qtde_item
    FROM solicitacoes_troca st
    JOIN item_pedido ip ON st.id_item_pedido = ip.id_item_pedido
    WHERE ip.id_variacao = v.id_variacao
      AND st.id_sol_troca = $1
    RETURNING v.id_variacao, v.estoque
  `;
    const result = await client.query(query, [id_sol_troca]);
    return result.rows[0];
  }

  static async criarCupomTroca(id_sol_troca, client = pool) {
    // Busca o valor do produto e a qtde da solicitação
    const queryValor = `
    SELECT
      st.qtde_item,
      p.valor_produto
    FROM solicitacoes_troca st
    JOIN item_pedido ip ON st.id_item_pedido = ip.id_item_pedido
    JOIN variacoes v    ON ip.id_variacao    = v.id_variacao
    JOIN produtos p     ON v.produto_id      = p.id_produto
    WHERE st.id_sol_troca = $1
  `;
    const { rows } = await client.query(queryValor, [id_sol_troca]);
    if (!rows.length) throw new Error('Solicitação não encontrada.');

    const { qtde_item, valor_produto } = rows[0];
    const frete = 20;
    const valor = parseFloat((qtde_item * parseFloat(valor_produto) + frete).toFixed(2));

    const crypto = require('crypto');
    const codigo = 'TROCA-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const queryCupom = `
    INSERT INTO cupons_troca (cod_cupom_troca, valor_cupom_troca, id_sol_troca)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
    const result = await client.query(queryCupom, [codigo, valor, id_sol_troca]);
    return result.rows[0];
  }

}

module.exports = SolicitacaoTrocaDAO;