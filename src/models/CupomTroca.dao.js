const pool = require('../database/connection');
const CupomTroca = require('./CupomTroca');

class CupomTrocaDAO {

  static async criar(cupom, client = pool) {
    const query = `
      INSERT INTO cupons_troca (nome_cupom_troca, cod_cupom_troca, valor_cupom_troca, id_sol_troca)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      cupom.nome_cupom_troca || null,
      cupom.cod_cupom_troca,
      cupom.valor_cupom_troca,
      cupom.id_sol_troca
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async buscarPorSolicitacao(id_sol_troca, client = pool) {
    const query = `
      SELECT * FROM cupons_troca
      WHERE id_sol_troca = $1
    `;
    const result = await client.query(query, [id_sol_troca]);
    return result.rows[0];
  }

  // ← MÉTODO NOVO
  static async buscarPorCodigo(cod_cupom_troca, client = pool) {
    const query = `
    SELECT 
      id_cupom_troca  AS id_cupom,
      cod_cupom_troca AS codigo,
      valor_cupom_troca AS valor,
      cliente_id,
      usado
    FROM cupons_troca
    WHERE cod_cupom_troca = $1
  `;
    const result = await client.query(query, [cod_cupom_troca]);
    return result.rows[0];
  }

  static gerarCodigo() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'TROCA-';
    for (let i = 0; i < 8; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }

  static async marcarComoUsado(id_cupom_troca, client = pool) {
    const query = `UPDATE cupons_troca SET usado = true WHERE id_cupom_troca = $1`;
    await client.query(query, [id_cupom_troca]);
  }

}

module.exports = CupomTrocaDAO;