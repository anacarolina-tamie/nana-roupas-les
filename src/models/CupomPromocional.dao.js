const pool = require('../database/connection');
const CupomPromocional = require('./CupomPromocional');

class CupomPromocionalDAO {

  // Cria um cupom promocional
  static async criar(cupom, client = pool) {
    const query = `
      INSERT INTO cupons_promocionais (nome_cupom_prom, cod_cupom_prom, valor_cupom_prom)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [
      cupom.nome_cupom_prom || null,
      cupom.cod_cupom_prom,
      cupom.valor_cupom_prom
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  // Busca cupom pelo código (usado no checkout)
  static async buscarPorCodigo(cod_cupom_prom, client = pool) {
    const query = `
      SELECT * FROM cupons_promocionais
      WHERE cod_cupom_prom = $1
    `;
    const result = await client.query(query, [cod_cupom_prom]);
    return result.rows[0];
  }

  // Lista todos os cupons promocionais (admin)
  static async listarTodos(client = pool) {
    const query = `
      SELECT * FROM cupons_promocionais
      ORDER BY id_cupom_prom DESC
    `;
    const result = await client.query(query);
    return result.rows;
  }

  // Deleta um cupom promocional (admin)
  static async deletar(id_cupom_prom, client = pool) {
    const query = `
      DELETE FROM cupons_promocionais
      WHERE id_cupom_prom = $1
    `;
    const result = await client.query(query, [id_cupom_prom]);
    return result.rowCount;
  }

}

module.exports = CupomPromocionalDAO;