const pool = require('../database/connection');

class CarrinhoDAO {

  // Busca o carrinho do cliente (ou cria um novo se não existir)
  static async buscarOuCriar(id_cliente) {
    const select = `SELECT * FROM carrinho WHERE id_cliente = $1`;
    let result = await pool.query(select, [id_cliente]);

    if (result.rows.length === 0) {
      const insert = `
        INSERT INTO carrinho (id_cliente)
        VALUES ($1)
        RETURNING *
      `;
      result = await pool.query(insert, [id_cliente]);
    }

    return result.rows[0];
  }

  // Lista os itens do carrinho com dados do produto e variação
static async listarItens(id_carrinho) {
    const query = `
      SELECT
        ic.id_item,
        ic.id_variacao,
        ic.quantidade,
        ic.preco_unitario,
        (ic.quantidade * ic.preco_unitario) AS subtotal,
        p.nome_produto,
        p.id_produto,
        v.url_imagem,
        v.tamanho,
        c.nome_cor,
        v.estoque
      FROM itens_carrinho ic
      JOIN variacoes v   ON ic.id_variacao = v.id_variacao
      JOIN produtos p    ON v.produto_id   = p.id_produto
      JOIN cores c       ON v.cor_id       = c.id_cor
      WHERE ic.id_carrinho = $1
      ORDER BY ic.id_item
    `;
    const result = await pool.query(query, [id_carrinho]);
    return result.rows;
  }

  // Adiciona item ao carrinho
  // Se já existir a mesma variação, soma a quantidade
  static async adicionarItem(id_carrinho, id_variacao, quantidade, preco_unitario) {
    const query = `
      INSERT INTO itens_carrinho (id_carrinho, id_variacao, quantidade, preco_unitario)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_carrinho, id_variacao)
      DO UPDATE SET quantidade = itens_carrinho.quantidade + EXCLUDED.quantidade
      RETURNING *
    `;
    const result = await pool.query(query, [id_carrinho, id_variacao, quantidade, preco_unitario]);
    return result.rows[0];
  }

  // Atualiza a quantidade de um item
  static async atualizarQuantidade(id_item, id_carrinho, quantidade) {
    const query = `
      UPDATE itens_carrinho
      SET quantidade = $1
      WHERE id_item = $2 AND id_carrinho = $3
      RETURNING *
    `;
    const result = await pool.query(query, [quantidade, id_item, id_carrinho]);
    return result.rows[0];
  }

  // Remove um item específico
  static async removerItem(id_item, id_carrinho) {
    const query = `
      DELETE FROM itens_carrinho
      WHERE id_item = $1 AND id_carrinho = $2
    `;
    const result = await pool.query(query, [id_item, id_carrinho]);
    return result.rowCount;
  }

  // Limpa todos os itens do carrinho (usado após finalizar o pedido)
  static async limpar(id_carrinho) {
    const query = `DELETE FROM itens_carrinho WHERE id_carrinho = $1`;
    const result = await pool.query(query, [id_carrinho]);
    return result.rowCount;
  }

  // Busca um item específico (usado para validar estoque na atualização)
  static async buscarItem(id_item, id_carrinho) {
    const query = `
      SELECT ic.*, v.estoque
      FROM itens_carrinho ic
      JOIN variacoes v ON ic.id_variacao = v.id_variacao
      WHERE ic.id_item = $1 AND ic.id_carrinho = $2
    `;
    const result = await pool.query(query, [id_item, id_carrinho]);
    return result.rows[0];
  }
}

module.exports = CarrinhoDAO;
